import React from 'react'

export function WithStyle<InnerPropsT extends {style?: React.CSSProperties}>(inner: React.FC<InnerPropsT>, styleDefaults: React.CSSProperties): React.FC<InnerPropsT>{
  return (props: InnerPropsT): ReturnType<React.FC<InnerPropsT>> => {
    return inner({...props, style: {...styleDefaults, ...props.style}})
  }
}