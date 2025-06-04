export function Button(props) {
  return <button {...props} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>{props.children}</button>;
}
