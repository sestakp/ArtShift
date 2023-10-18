import React, { useCallback, useEffect, useState } from 'react';
import { Accept, useDropzone } from 'react-dropzone';
import styles from './Main.module.css';
import { Grid } from '@mui/material';
import ResizableLayout from '../../Wrappers/ResizeableWrapper';
import { InputNumber } from 'primereact/inputnumber';
import { ToggleButton } from 'primereact/togglebutton';
import { getRandomInt, getRandomBoolean } from '../../utils/randomProvider';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { AiFillGithub } from 'react-icons/ai';




function MainApp() {
    const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
    const [canvas, setCanvas] = useState<HTMLCanvasElement | undefined>(undefined);

    const [minStripeHeight, setMinStripeHeight] = useState<number>(50);
    const [maxStripeHeight, setMaxStripeHeight] = useState<number>(100);
    const [minStripeShift, setMinStripeShift] = useState<number>(10);
    const [maxStripeShift, setMaxStripeShift] = useState<number>(30);
    const [verticalRotate, setVerticalRotate] = useState<boolean>(false);
    const [horizontalRotate, setHorizontalRotate] = useState<boolean>(false);

    const handleDownloadClick = () => {
        if (canvas != undefined) {

            // Create a data URL from the canvas
            const dataURL = canvas.toDataURL('image/png');

            // Create a temporary download link
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = 'artShift.png'; // Specify the filename

            // Trigger a click event to initiate the download
            a.click();
        }
    };

    const getRandomStripHeight = (imgHeight: number, current_y: number) => {
        var stripe_height = getRandomInt(minStripeHeight, maxStripeHeight)

        //Last row correction
        if (current_y + stripe_height > imgHeight) {
            stripe_height = imgHeight - current_y
        }
        return stripe_height
    }

    const getRandomStripeShift = (isOdd: boolean) => {
        var stripe_shift = getRandomInt(minStripeShift, maxStripeShift)
        if (isOdd) {
            return stripe_shift * -1
        }
        return stripe_shift
    }


    const drawStripe = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, y: number, stripWidth: number, stripe_height: number, isOdd: boolean) => {

        const stripe_shift = getRandomStripeShift(isOdd)
        ctx.drawImage(
            img,
            0, //The x coordinate where to start clipping
            y, //The y coordinate where to start clipping
            stripWidth, //The width of the clipped image
            stripe_height, //The height of the clipped image
            stripe_shift, //The x coordinate where to place the image on the canvas
            y, //The y coordinate where to place the image on the canvas
            stripWidth, //The width of the image to use
            stripe_height //The height of the image to use 
        );
    }


    const drawStripeWithTransform = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, y: number, stripWidth: number, stripe_height: number, isOdd: boolean) => {
        
        var horizontal = false;
        if(horizontalRotate){
            horizontal = getRandomBoolean()
        }
        

        var vertical = false;
        if(verticalRotate){
            vertical = getRandomBoolean()
        }
        
        ctx.save();  // save the current canvas state
        ctx.setTransform(
            horizontal ? -1 : 1, 0, // set the direction of x axis
            0, vertical ? -1 : 1,   // set the direction of y axis
            (horizontal ? img.width : 0), // set the x origin
            (vertical ? img.height : 0)   // set the y origin
        );
        drawStripe(ctx, img, y, stripWidth, stripe_height, isOdd);
        ctx.restore(); // restore the state as it was when this function was called
    }


    const initContext = (canvas: HTMLCanvasElement, img: HTMLImageElement) => {

        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, img.width, img.height);

        return ctx
    }

    function clipCanvas(canvas: HTMLCanvasElement, leftPixels: number, rightPixels: number) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width - leftPixels - rightPixels;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;

        const sourceX = leftPixels; // X coordinate where to start clipping
        const sourceWidth = canvas.width - leftPixels - rightPixels; // Width of the clipped area
        const destinationX = 0; // X coordinate where to place the clipped area on the temporary canvas
        const destinationWidth = sourceWidth; // Width of the area on the temporary canvas

        // Draw the clipped area onto the temporary canvas
        tempCtx.drawImage(canvas, sourceX, 0, sourceWidth, canvas.height, destinationX, 0, destinationWidth, canvas.height);

        // Clear the original canvas
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the clipped content from the temporary canvas back onto the original canvas
        ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
    }


    function DrawImage(img: HTMLImageElement, canvas: HTMLCanvasElement) {
        const ctx = initContext(canvas, img)

        const stripWidth = img.width; // Adjust strip width as needed

        var current_y = 0;
        var isOdd = false;

        while (current_y < img.height) {

            const stripe_height = getRandomStripHeight(img.height, current_y)

            drawStripeWithTransform(ctx, img, current_y, stripWidth, stripe_height, isOdd);
            current_y += stripe_height
            isOdd = !isOdd
        }
        clipCanvas(canvas, maxStripeShift, maxStripeShift);
    }


    function reDrawImage() {
        if (image != undefined && canvas != undefined) {
            DrawImage(image, canvas)
        }
    }
    useEffect(() => {
        reDrawImage()
    }, [minStripeHeight, maxStripeHeight, minStripeShift, maxStripeShift, verticalRotate, horizontalRotate])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();

        reader.onload = function () {
            const img = new Image();
            img.src = reader.result as string;

            img.onload = function () {
                if (canvas != undefined) {
                    DrawImage(img, canvas)
                }

            };

            setImage(img);
        };

        reader.readAsDataURL(file);
    }, [canvas, setImage]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { 'image/*': ['*'] } as Accept,
    });

    console.log("max shift: ", maxStripeShift)

    return (
        <div>
            <nav className={styles.navigation}>
                <h1>ArtShift</h1>
                <a href="https://github.com/sestakp/ArtShift" target='_blank'><AiFillGithub /></a>
            </nav>


            <ResizableLayout>
                <div {...getRootProps()} className={styles.dropzone}>
                    <input {...getInputProps()} />
                    {image == undefined && <p>Drag & drop an image here, or click to select an image</p>}

                    <canvas
                        ref={(ref: HTMLCanvasElement) => setCanvas(ref)}
                        width={600} // Adjust canvas width as needed
                        height={600} // Adjust canvas height as needed
                        className={styles.canvas}
                    />
                </div>
                <div style={{ backgroundColor: "#373F51", width: "100%", height: "100vh", color: "#A9BCD0", }}>
                    <div style={{ margin: "auto", textAlign: "center" }}>

                        <h2>Settings</h2>

                        <h3>Stripe height</h3>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <InputNumber max={maxStripeHeight} value={minStripeHeight} onValueChange={(e) => setMinStripeHeight(e.value as number)}/>
                            <span style={{ fontSize: "30px", padding: "0 10px 0 10px" }}>to</span>
                            <InputNumber min={minStripeHeight} value={maxStripeHeight} onValueChange={(e) => setMaxStripeHeight(e.value as number)}/>
                        </div>
                        <h3>Stripe shift</h3>

                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <InputNumber max={maxStripeShift} value={minStripeShift} onValueChange={(e) => setMinStripeShift(e.value as number)} />
                            <span style={{ fontSize: "30px", padding: "0 10px 0 10px" }}>to</span>
                            <InputNumber min={minStripeShift} value={maxStripeShift} onValueChange={(e) => setMaxStripeShift(e.value as number) } />
                        </div>
                        <h3 style={{ marginBottom: 0 }}>Rotation</h3>
                        <div style={{ display: "inline-flex", width: "100%", justifyContent: "space-around" }}>
                            <div>
                                <h4>Horizontal</h4>
                                <ToggleButton checked={horizontalRotate} onChange={(e) => setHorizontalRotate(e.value)} className="w-8rem" />
                            </div>
                            <div>
                                <h4>Vertical</h4>
                                <ToggleButton checked={verticalRotate} onChange={(e) => setVerticalRotate(e.value)} className="w-8rem" />
                            </div>
                        </div>
                        <div style={{ display: "inline-flex", width: "100%", justifyContent: "space-around" }}>
                            <Button label="Regenerate" onClick={reDrawImage} style={{ margin: "20px 0 20px 0" }} />

                            <Button label="Download image" onClick={handleDownloadClick} style={{ margin: "20px 0 20px 0" }} />
                        </div>
                        <Card style={{ margin: "20px" }}>
                            Hello, this application was created at BUT FIT as a project for art informatics.
                            Since I was mostly dissatisfied with the tools and was creating my own python scripts,
                            I figured why not try to convert it to web form. I hope you like the application. 
                            You can resize windows and upload new photo over actual.
                        </Card>
                    </div>
                </div>
            </ResizableLayout>




        </div>
    );
}



export default MainApp;