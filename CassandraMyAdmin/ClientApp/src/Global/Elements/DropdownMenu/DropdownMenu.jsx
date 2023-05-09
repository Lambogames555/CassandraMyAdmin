import './DropdownMenu.css'

import {useEffect, useRef, useState} from 'react';
import {useTranslation} from "react-i18next";

import moreIcon from '../../../Resources/GoogleMaterialIcons/more.svg'

// TODO make the "Index" system better
function DropdownMenu({data, buttonList, onItemSelected}) {
    const {t} = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const targetRef = useRef(null);

    // Check if the user clicked outside the dropdown menu and close it
    useEffect(() => {
        function handleClickOutside(event) {
            if (targetRef.current && !targetRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [targetRef]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleClick = (index) => {
        setIsOpen(false);

        onItemSelected(data, index)
    }

    return (
        <div ref={targetRef} className="dropdown">

            <button className="dropdown-toggle" type="button" onClick={toggleDropdown}>
                <img src={moreIcon} alt={""}/>
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    {buttonList.map((item, index) => (
                        <button
                            key={index}
                            className="dropdown-item"
                            onClick={() => handleClick(index)}
                        >
                            {t(item)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DropdownMenu;
