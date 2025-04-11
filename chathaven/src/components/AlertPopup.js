import "./styles/AlertPopup.css";

export default function AlertPopup({ message }) {
  return (
    <div className="alertPopup">
      <span>{message}</span>
    </div>
  );
}
