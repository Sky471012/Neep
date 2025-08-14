import React from 'react'

export default function Whatsapp() {
    const message = encodeURIComponent("I am writing to express my interest in your course offerings and would like to request further information.");
    
    return (<>

        <a
            href={`https://wa.me/919313214643?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className='whatsapp-link'
        >
            <i className="bi bi-whatsapp"></i>
        </a>


    </>)
}
