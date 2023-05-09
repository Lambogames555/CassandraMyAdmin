import './CustomButton.css'

function CustomButton({text, icon, isActive, onClick}) {
    return (
        <button className={`custom-button ${isActive ? "active" : ""}`} onClick={() => onClick()}>
            <span className="custom-button-icon-box">
                <img className={"custom-button-icon"} src={icon} alt={""}/>
            </span>
            <p className={"custom-button-text"}>{text}</p>
        </button>
    );
}

export default CustomButton;
