import './StatisticsBox.css'

function StatisticsBox({text, textBottom, value, faIcon, color, color2}) {
    return (
        <div className={"statistics-info-box center"}
             style={{'background': `linear-gradient(90deg, ${color}, ${color2}, #2A304A)`}}>
            <div className={"statistics-info-box-background"}
                 style={{'backgroundImage': `url(${faIcon})`}}>

                <div className={"statistics-info-box-text"}>
                    <div className={"statistics-info-box-header-text"}>
                        <p className={"statistics-info-box-value-text"}>{value}</p>
                        <p>{text}</p>
                    </div>
                    <p className={"statistics-info-box-bottom-text"}>{textBottom}</p>
                </div>
            </div>
        </div>
    );
}

export default StatisticsBox;