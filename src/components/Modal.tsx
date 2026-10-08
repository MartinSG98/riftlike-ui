import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cx } from "../lib/format";
import styles from "./Modal.module.css";

/** A dialog over a dimmed backdrop. Escape or a click outside closes it. */
export function Modal({
  labelledBy,
  onClose,
  wide,
  children,
}: {
  labelledBy: string;
  onClose: () => void;
  wide?: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Rendered into body so sticky panels and the map, which form their own stacking
  // contexts, can never paint over the dialog.
  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={cx(styles.modal, wide && styles.wide)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
