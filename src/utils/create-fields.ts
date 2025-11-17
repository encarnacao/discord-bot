export function createPropsFields(props: { [key: string]: any }) {
  const fields = [];
  for (const key in props) {
    fields.push({ name: key, value: String(props[key]), inline: false });
  }
  return fields;
}
