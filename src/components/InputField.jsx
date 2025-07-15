// src/components/InputField.jsx
const InputField = ({ label, name, value, onChange, ...props }) => (
  <div style={{ marginBottom: "1rem" }}>
    <label style={{ fontWeight: "bold" }}>{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      {...props}
      style={{ width: "100%", padding: "6px" }}
      autoComplete="off"
    />
  </div>
);

export default InputField;
