// TNInput.jsx
import React, { useState } from "react";
import { Form } from "react-bootstrap";
import Select from "react-select";
import TNDatepicker from "./TNDatepicker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "../scss/TNInput.scss";

const TNInput = ({
  label,
  name,
  type = "text",
  value,
  error,
  touched,
  options = [],
  placeholder,
  onChange,
  onBlur,
  disabled = false,
  margin = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const getInputClass = () => {
    if (touched?.[name] && error?.[name]) return "form-field form-field-error";
    if (touched?.[name] && !error?.[name])
      return "form-field form-field-success";
    return "form-field";
  };
  return (
    <Form.Group className={`form-group custom-input ${margin}`}>
      {label && <Form.Label>{label}</Form.Label>}

      {type === "textarea" ? (
        <Form.Control
          as="textarea"
          rows={4}
          name={name}
          placeholder={placeholder}
          className={getInputClass()}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          {...props}
        />
      ) : type === "select" ? (
        <Select
          name={name}
          options={options}
          value={options.find((opt) => opt.value === value) || null}
          onChange={(selected) =>
            onChange({ target: { name, value: selected?.value || "" } })
          }
          onBlur={onBlur}
          classNamePrefix="react-select-prefix"
          placeholder={placeholder}
          isDisabled={disabled}
          {...props}
        />
      ) : type === "date" ? (
        <TNDatepicker
          name={name}
          label={null}
          selected={value}
          onChange={(val) => onChange({ target: { name, value: val } })}
          onBlur={onBlur}
          error={error}
          touched={touched}
          placeholderText={placeholder}
          disabled={disabled}
          {...props}
        />
      ) : type === "password" ? (
        <>
          <Form.Control
            type={showPassword ? "text" : "password"}
            name={name}
            placeholder={placeholder}
            className={getInputClass()}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            style={{ paddingRight: "2.5rem" }}
            {...props}
          />
          <FontAwesomeIcon
            icon={showPassword ? faEye : faEyeSlash}
            onClick={() => setShowPassword(!showPassword)}
            className="position-absolute eye-icon"
          />
        </>
      ) : (
        <Form.Control
          type={type}
          name={name}
          placeholder={placeholder}
          className={getInputClass()}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          {...props}
        />
      )}

      {touched?.[name] && error?.[name] && (
        <div className="text-danger mt-1">{error?.[name]}</div>
      )}
    </Form.Group>
  );
};

export default TNInput;
