import React from 'react'

export default function Link({ href, children, className, onClick, ...props }: any) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <a href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}
