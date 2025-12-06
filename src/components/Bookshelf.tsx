import styles from "./Bookshelf.module.css";

interface BookshelfProps {
    children: React.ReactNode;
    label?: string;
}

export default function Bookshelf({ children, label }: BookshelfProps) {
    return (
        <div className={styles.shelfContainer}>
            {label && <h2 className={styles.label}>{label}</h2>}
            <div className={styles.grid}>
                {children}
            </div>
            <div className={styles.shelfBase} />
        </div>
    );
}
