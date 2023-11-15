


export default function downloadCanvas(canvas: HTMLCanvasElement | undefined){
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
}