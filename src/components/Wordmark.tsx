import { cx } from "../lib/format";
import styles from "./Wordmark.module.css";

export function Wordmark({ size = "md" }: { size?: "sm" | "md" | "xl" }) {
  return <span className={cx(styles.mark, styles[size])}>Riftlike</span>;
}
