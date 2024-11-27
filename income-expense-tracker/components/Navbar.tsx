'use client';

import React, { useState, useEffect } from 'react'

export default function Navbar() {
    const [isVisible, setIsVisible] = useState(true);  // State to track visibility
    const [lastScrollY, setLastScrollY] = useState(0);  // Track last scroll position

    const handleScroll = () => {
        if (window.scrollY > lastScrollY) {
            // Scrolling down
            setIsVisible(false);
        } else {
            // Scrolling up
            setIsVisible(true);
        }
        setLastScrollY(window.scrollY); // Update last scroll position
    };

    // Set up the scroll event listener when component mounts
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);

    return (
        <div
            className={`fixed w-full ${isVisible ? 'translate-y-0' : '-translate-y-full'} transition-transform duration-300 ease-in-out`}
            style={{ zIndex: 1000 }}
        >
            <div className='h-16 sm:h-18 md:h-20 flex flex-col justify-between items-center bg-black'>
                {/* Navbar content goes here */}
                <p className="text-white">Navbar</p>
            </div>
        </div>
    );
}
