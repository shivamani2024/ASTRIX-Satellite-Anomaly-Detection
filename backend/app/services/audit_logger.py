"""Cryptographic SHA-256 Hash-Chain Audit Ledger Service."""
import hashlib
import json
import os
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from app.logger import logger
from app.models.audit import AuditEntry, AuditChainVerification


class AuditLogger:
    """Tamper-evident cryptographically chained audit ledger for all autonomous & operator actions."""

    GENESIS_HASH = "0" * 64

    def __init__(self, ledger_file: Optional[str] = None):
        if ledger_file is None:
            ledger_file = os.path.join(
                os.path.dirname(os.path.dirname(__file__)), "data", "audit_ledger.json"
            )
        self.ledger_file = ledger_file
        self.chain: List[AuditEntry] = []
        self._load_or_initialize()

    def _compute_hash(
        self,
        block_index: int,
        timestamp: str,
        actor: str,
        action_type: str,
        target: str,
        payload_hash: str,
        risk_tier: str,
        status: str,
        previous_block_hash: str,
    ) -> str:
        """Compute SHA-256 hash of block contents."""
        block_string = (
            f"{block_index}:{timestamp}:{actor}:{action_type}:{target}:"
            f"{payload_hash}:{risk_tier}:{status}:{previous_block_hash}"
        )
        return hashlib.sha256(block_string.encode("utf-8")).hexdigest()

    def _hash_payload(self, payload: Any) -> str:
        """Compute deterministic SHA-256 hash of arbitrary payload."""
        if isinstance(payload, (dict, list)):
            canonical_json = json.dumps(payload, sort_keys=True, default=str)
        else:
            canonical_json = str(payload)
        return hashlib.sha256(canonical_json.encode("utf-8")).hexdigest()

    def _load_or_initialize(self):
        """Load existing ledger from disk or create Genesis block."""
        if os.path.exists(self.ledger_file):
            try:
                with open(self.ledger_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                self.chain = [AuditEntry(**item) for item in data]
                logger.info(f"Loaded {len(self.chain)} audit blocks from {self.ledger_file}")
                return
            except Exception as e:
                logger.error(f"Failed to load existing audit ledger: {e}. Reinitializing.")

        # Create Genesis Block
        genesis_ts = datetime(2026, 9, 17, 12, 0, 0, tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
        genesis_payload_hash = hashlib.sha256(b"ASTRIX_GENESIS_INITIALIZATION").hexdigest()
        genesis_block_hash = self._compute_hash(
            block_index=0,
            timestamp=genesis_ts,
            actor="SYSTEM_INIT",
            action_type="GENESIS_BLOCK",
            target="LEO-ORBIT-1/SAT-ALPHA-01",
            payload_hash=genesis_payload_hash,
            risk_tier="T0",
            status="INITIALIZED",
            previous_block_hash=self.GENESIS_HASH,
        )

        genesis_entry = AuditEntry(
            block_index=0,
            timestamp=genesis_ts,
            actor="SYSTEM_INIT",
            action_type="GENESIS_BLOCK",
            target="LEO-ORBIT-1/SAT-ALPHA-01",
            payload_hash=genesis_payload_hash,
            risk_tier="T0",
            status="INITIALIZED",
            previous_block_hash=self.GENESIS_HASH,
            block_hash=genesis_block_hash,
        )

        self.chain = [genesis_entry]
        self._save_to_disk()
        logger.info("Initialized new cryptographically verified audit ledger with Genesis block")

    def _save_to_disk(self):
        """Persist chain to disk."""
        try:
            os.makedirs(os.path.dirname(self.ledger_file), exist_ok=True)
            with open(self.ledger_file, "w", encoding="utf-8") as f:
                json.dump([item.model_dump() for item in self.chain], f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save audit ledger: {e}")

    def append_entry(
        self,
        actor: str,
        action_type: str,
        target: str,
        payload: Any,
        risk_tier: str = "T0",
        status: str = "SUCCESS",
    ) -> AuditEntry:
        """Append a new verified entry to the hash-chain."""
        block_index = len(self.chain)
        previous_block = self.chain[-1]
        previous_block_hash = previous_block.block_hash
        timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        payload_hash = self._hash_payload(payload)

        block_hash = self._compute_hash(
            block_index=block_index,
            timestamp=timestamp,
            actor=actor,
            action_type=action_type,
            target=target,
            payload_hash=payload_hash,
            risk_tier=risk_tier,
            status=status,
            previous_block_hash=previous_block_hash,
        )

        entry = AuditEntry(
            block_index=block_index,
            timestamp=timestamp,
            actor=actor,
            action_type=action_type,
            target=target,
            payload_hash=payload_hash,
            risk_tier=risk_tier,
            status=status,
            previous_block_hash=previous_block_hash,
            block_hash=block_hash,
        )

        self.chain.append(entry)
        self._save_to_disk()
        logger.info(
            f"Appended Audit Block #{block_index} [{action_type}] by {actor}. Hash: {block_hash[:12]}..."
        )
        return entry

    def verify_chain(self) -> AuditChainVerification:
        """Verify the integrity of all blocks in the cryptographic chain."""
        if not self.chain:
            return AuditChainVerification(
                is_valid=False, total_blocks=0, tamper_detected=True, message="Audit chain is empty"
            )

        # Check Genesis
        first_block = self.chain[0]
        if first_block.previous_block_hash != self.GENESIS_HASH:
            return AuditChainVerification(
                is_valid=False,
                total_blocks=len(self.chain),
                tamper_detected=True,
                first_invalid_block=0,
                message="Genesis block previous hash is corrupted",
            )

        for i in range(1, len(self.chain)):
            prev = self.chain[i - 1]
            curr = self.chain[i]

            # 1. Verify link
            if curr.previous_block_hash != prev.block_hash:
                return AuditChainVerification(
                    is_valid=False,
                    total_blocks=len(self.chain),
                    tamper_detected=True,
                    first_invalid_block=i,
                    message=f"Block #{i} previous_block_hash does not match Block #{i-1} block_hash",
                )

            # 2. Verify current block's hash
            expected_hash = self._compute_hash(
                block_index=curr.block_index,
                timestamp=curr.timestamp,
                actor=curr.actor,
                action_type=curr.action_type,
                target=curr.target,
                payload_hash=curr.payload_hash,
                risk_tier=curr.risk_tier,
                status=curr.status,
                previous_block_hash=curr.previous_block_hash,
            )

            if curr.block_hash != expected_hash:
                return AuditChainVerification(
                    is_valid=False,
                    total_blocks=len(self.chain),
                    tamper_detected=True,
                    first_invalid_block=i,
                    message=f"Block #{i} hash mismatch: recalculation does not match stored block_hash",
                )

        return AuditChainVerification(
            is_valid=True,
            total_blocks=len(self.chain),
            tamper_detected=False,
            first_invalid_block=None,
            message=f"All {len(self.chain)} blocks cryptographically verified with 100% integrity",
        )

    def get_entries(self, limit: int = 100) -> List[AuditEntry]:
        """Return most recent audit entries."""
        return self.chain[-limit:]

    def tamper_block_for_demo(self, block_index: int, fake_actor: str) -> bool:
        """Simulate tampering with a block for demonstration and test verification."""
        if 0 <= block_index < len(self.chain):
            # Mutate in memory without updating hash
            target_entry = self.chain[block_index]
            mutated = target_entry.model_dump()
            mutated["actor"] = fake_actor
            self.chain[block_index] = AuditEntry(**mutated)
            self._save_to_disk()
            logger.warning(f"Simulated TAMPERING on block #{block_index} with actor {fake_actor}")
            return True
        return False


audit_logger = AuditLogger()
