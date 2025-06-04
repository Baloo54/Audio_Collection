export function Card({ children, className }) {
  return <div className={className} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>{children}</div>;
}

export function CardContent({ children }) {
  return <div style={{ margin: '1rem 0' }}>{children}</div>;
}
