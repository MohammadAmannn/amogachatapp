import React from 'react'

export default function Image({ src, alt, className, width, height, ...props }: any) {
  const { layout, objectFit, priority, ...cleanProps } = props
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={{
        maxWidth: '100%',
        height: 'auto',
        objectFit: objectFit || 'cover',
      }}
      {...cleanProps}
    />
  )
}
