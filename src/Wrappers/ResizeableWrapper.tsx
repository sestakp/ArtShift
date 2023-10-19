import React, { useEffect, useState } from "react";
import styles from "./ResizeableWrapper.module.css"
const ResizableWrapper = ({ children }: { children?: React.ReactNode }) => {
  const [layout, setLayout] = useState({
    leftPane: {
      width: 70,
      minWidth: 5,
      maxWidth: undefined,
    },
    rightPane: {
      width: 30,
      minWidth: 18,
      maxWidth: 70
    },
  });

  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const handleMouseDown = (event: any) => {
    setIsResizing(true);
    setStartX(event.clientX);
    setStartWidth(layout.leftPane.width);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleMouseMove = (event:any) => {
    if (!isResizing) return;

    const diffX = event.clientX - startX;
    const newWidth = startWidth + (diffX / window.innerWidth) * 100;

    if (newWidth >= 0 && newWidth <= 100) {
      const newLayout = {
        leftPane: { ...layout.leftPane,width: newWidth },
        rightPane: { ...layout.rightPane,width: 100 - newWidth },
      };


      if(newLayout.leftPane.minWidth != undefined){
        if(newLayout.leftPane.width < newLayout.leftPane.minWidth){
            return;
        }
      } 
      if(newLayout.leftPane.maxWidth != undefined){
        if(newLayout.leftPane.width > newLayout.leftPane.maxWidth){
            return;
        }
      } 
      if(newLayout.rightPane.minWidth != undefined){
        if(newLayout.rightPane.width < newLayout.rightPane.minWidth){
            return;
        }
      } 
      if(newLayout.rightPane.maxWidth != undefined){
        if(newLayout.rightPane.width > newLayout.rightPane.maxWidth){
            return;
        }
      } 
      setLayout(newLayout);
    }
  };

  console.log(layout.leftPane.width)
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  if (children && Array.isArray(children) && children.length >= 2) {
    return (
      <div className={styles.container}>
        <div className={styles.leftPane} style={{ width: layout.leftPane.width + "%" }}>
          {children[0]}
        </div>
        <div className={styles.splitter} onMouseDown={handleMouseDown } />
        <div className={styles.rightPane} style={{ width: layout.rightPane.width + "%" }}>
          {children[1]}
        </div>
      </div>
    );
  } else {
    return <div />;
  }
};

export default ResizableWrapper;