import React from 'react';

interface CustomerPatienceDisplayProps {
    patience: number; // Current patience percentage (0-100)
}

const CustomerPatienceDisplay = ({ patience }: CustomerPatienceDisplayProps) => {
    let barColorClass = '';
    let emoji = '';

    if (patience > 66) {
        barColorClass = 'bg-green-500';
        emoji = '😊'; // Happy
    } else if (patience > 33) {
        barColorClass = 'bg-yellow-500';
        emoji = '😐'; // Content
    } else {
        barColorClass = 'bg-red-500';
        emoji = '😠'; // Annoyed
    }

    const emojiColorStyle = {
        color: patience > 66 ? 'green' : patience > 33 ? 'orange' : 'red',
    };


    return (
        <div className="flex items-center justify-center w-full" style={{ minWidth: '50px' }}>
            <span className="text-xs mr-1" style={emojiColorStyle}>{emoji}</span>
            <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden" style={{ flexGrow: 1 }}>
                <div
                    className={`h-full ${barColorClass}`}
                    style={{ width: `${patience}%` }}
                />
            </div>
        </div>
    );
};

export default CustomerPatienceDisplay; 