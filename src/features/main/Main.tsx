import React, { useCallback, useEffect, useState } from 'react';
import { Accept, useDropzone } from 'react-dropzone';
import styles from './Main.module.css';
import { CardContent, Grid } from '@mui/material';
import ResizableLayout from '../../Wrappers/ResizeableWrapper';
import { InputNumber } from 'primereact/inputnumber';
import { ToggleButton } from 'primereact/togglebutton';
import { getRandomInt, getRandomBoolean } from '../../utils/randomProvider';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { AiFillGithub } from 'react-icons/ai';
import { func } from 'prop-types';
import downloadCanvas from '../../utils/imageDownloader';



function MainApp() {
    const [originalSize, setOriginalSize] = useState<{x: number, y:number}>({x:0,y:0})
    const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
    const [canvas, setCanvas] = useState<HTMLCanvasElement | undefined>(undefined);

    const [minStripeHeight, setMinStripeHeight] = useState<number>(50);
    const [maxStripeHeight, setMaxStripeHeight] = useState<number>(100);
    const [minStripeShift, setMinStripeShift] = useState<number>(10);
    const [maxStripeShift, setMaxStripeShift] = useState<number>(30);
    const [verticalRotate, setVerticalRotate] = useState<boolean>(false);
    const [horizontalRotate, setHorizontalRotate] = useState<boolean>(false);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
        setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener('resize', handleResize);

        return () => {
        window.removeEventListener('resize', handleResize);
        };
    }, []);




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


    const drawStripe = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, y: number, stripWidth: number, stripe_height: number, isOdd: boolean, vertical: boolean) => {

        const stripe_shift = getRandomStripeShift(isOdd)
        ctx.drawImage(
            img,
            0, //The x coordinate where to start clipping
            y, //The y coordinate where to start clipping
            stripWidth, //The width of the clipped image
            stripe_height, //The height of the clipped image
            stripe_shift, //The x coordinate where to place the image on the canvas
            (vertical? img.height - y - stripe_height : y), //The y coordinate where to place the image on the canvas
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
        drawStripe(ctx, img, y, stripWidth, stripe_height, isOdd, vertical);
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


    function addWrapper(content: JSX.Element[]):JSX.Element{
        if(isMobile){
            return (<Grid container>
                {content[0]}
                {content[1]}
            </Grid>)
        }
        else{
            return(<ResizableLayout>
                {content}
            </ResizableLayout>)
        }
    }

    function randomizeParameters(){
        if(canvas != undefined && image != undefined){
            const newMinStripHeight = getRandomInt(1, originalSize.y*1/3)
            const newMaxStripHeight = getRandomInt(newMinStripHeight + 1, originalSize.y *2/3)

            const newMinStripShift = getRandomInt(1,originalSize.x*1/5)
            const newMaxStripShift = getRandomInt(newMinStripShift + 1,originalSize.x/2)

            setMinStripeHeight(newMinStripHeight)
            setMaxStripeHeight(newMaxStripHeight)
            setMinStripeShift(newMinStripShift)
            setMaxStripeShift(newMaxStripShift)

            setVerticalRotate(getRandomBoolean())
            setHorizontalRotate(getRandomBoolean())
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
                    setOriginalSize({x: img.width, y: img.height})
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



    const content = [
    <Grid item md={6} xs={12}  className={styles.dropzone} style={{height: isMobile ? "auto" : "90vh"}}>
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {image == undefined && <p>Drag & drop an image here, or click to select an image</p>}

            <canvas
                ref={(ref: HTMLCanvasElement) => setCanvas(ref)}
                width={600}
                height={600}
                className={styles.canvas}
            />
        </div>
    </Grid>,
    <Grid md={6} xs={12} item style={{ backgroundColor: "#121212", width: "100%", height: isMobile ? "auto" : "90vh", color: "#A9BCD0", }}>
        <div style={{ margin: "auto", textAlign: "center" }}>

            <h2>Settings</h2>

            <h3>Stripe height</h3>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <InputNumber className={styles.myInput + " p-inputtext-sm"} style={{padding: "10px"}} max={maxStripeHeight} value={minStripeHeight} onValueChange={(e) => setMinStripeHeight(e.value as number)}/>
                <span style={{ fontSize: "30px", padding: "0 10px 0 10px" }}>-</span>
                <InputNumber className={styles.myInput + " p-inputtext-sm"} style={{padding: "10px"}} min={minStripeHeight} value={maxStripeHeight} onValueChange={(e) => setMaxStripeHeight(e.value as number)}/>
            </div>
            <h3>Stripe shift</h3>

            <div style={{ display: "flex", justifyContent: "center" }}>
                <InputNumber className={styles.myInput + " p-inputtext-sm"} style={{padding: "10px"}} max={maxStripeShift} value={minStripeShift} onValueChange={(e) => setMinStripeShift(e.value as number)} />
                <span style={{ fontSize: "30px", padding: "0 10px 0 10px" }}>-</span>
                <InputNumber className={styles.myInput + " p-inputtext-sm"} style={{padding: "10px"}} min={minStripeShift} value={maxStripeShift} onValueChange={(e) => setMaxStripeShift(e.value as number) } />
            </div>
            <h3 style={{ marginBottom: 0 }}>Rotation</h3>
            <div style={{ display: "inline-flex", width: "100%", justifyContent: "space-around" }}>
                <div>
                    <h4>Horizontal</h4>
                    <ToggleButton className={styles.myToggle + " w-6rem"} checked={horizontalRotate} onChange={(e) => setHorizontalRotate(e.value)} />
                </div>
                <div>
                    <h4>Vertical</h4>
                    <ToggleButton className={styles.myToggle + " w-6rem"} checked={verticalRotate} onChange={(e) => setVerticalRotate(e.value)} />
                </div>
            </div>
            <div style={{ display: "inline-flex", width: "100%", justifyContent: "space-around" }}>
                <Button size="small" label="Regenerate" onClick={reDrawImage} style={{ margin: "40px 0 40px 0" }} />

                <Button size="small" label="Randomize" onClick={randomizeParameters} style={{ margin: "40px 0 40px 0" }} />
            </div>
            <Card style={{ margin: "10px", padding: 0 }}>
                This app, born from a BUT FIT art informatics project, transforms my dissatisfaction 
                with tools into Python scripts. Now, it's a web app. Enjoy! Resize windows and upload new photos seamlessly.
            </Card>

            
            <Button size="small" label="Download image" onClick={() => downloadCanvas(canvas)} style={{ margin: "20px 0 20px 0" }} />
        </div>
    </Grid>
    ]
    return (
        <div>
            <nav className={styles.navigation}>
                <h1>ArtShift</h1>
                <a href="https://github.com/sestakp/ArtShift" target='_blank'><AiFillGithub /></a>
            </nav>
            
            {addWrapper(content)}




        </div>
    );
}



export default MainApp;