import React from 'react';

const Carousel = ({ items }) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
    };

    return (
        <div className="carousel">
            <button onClick={prevSlide} className="carousel-button prev">Previous</button>
            <div className="carousel-content">
                {items[currentIndex]}
            </div>
            <button onClick={nextSlide} className="carousel-button next">Next</button>
        </div>
    );
};

export default Carousel;