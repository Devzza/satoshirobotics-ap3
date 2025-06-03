import React from 'react';

type Props = {
  message: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  fontWeight?: string;
};

const TopBar: React.FC<Props> = ({
  message,
  backgroundColor = '#f0f0f0',
  textColor = '#333',
  fontSize = '1rem',
  fontWeight = 'normal',
}) => {
  const style = {
    backgroundColor: backgroundColor,
    color: textColor,
    fontSize: fontSize,
    fontWeight: fontWeight,
    padding: '0.5rem',
    textAlign: 'center',
    width: '100%',
  };

  return (
    <div style={style}>
      {message}
    </div>
  );
};

export default TopBar;