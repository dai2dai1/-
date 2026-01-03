import React from 'react';

const Avatar = ({ avatar, size = '4rem' }) => {
    // Check if avatar is a base64 image or a URL (simple check for now)
    const isImage = avatar?.startsWith('data:image') || avatar?.startsWith('http');

    if (isImage) {
        return (
            <img
                src={avatar}
                alt="Avatar"
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
            />
        );
    }

    return (
        <div style={{
            fontSize: size,
            lineHeight: size,
            width: size,
            height: size,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {avatar || '👶'}
        </div>
    );
};

export default Avatar;
