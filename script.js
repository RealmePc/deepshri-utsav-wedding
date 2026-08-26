/* =========================================================
   ELEMENTS
========================================================= */

const preloader =
    document.getElementById("preloader");

const envelope =
    document.getElementById("envelope");

const openInvitation =
    document.getElementById("openInvitation");

const mainWebsite =
    document.getElementById("mainWebsite");

const musicButton =
    document.getElementById("musicButton");

const weddingMusic =
    document.getElementById("weddingMusic");

const petals =
    document.getElementById("petals");


/* =========================================================
   PRELOADER
========================================================= */

window.addEventListener("load", function () {

    setTimeout(function () {

        if (preloader) {
            preloader.classList.add("hide");
        }

    }, 700);

});


/* =========================================================
   OPEN INVITATION
========================================================= */

if (openInvitation) {

    openInvitation.addEventListener(
        "click",
        function () {

            envelope.classList.add("open");

            openInvitation.disabled = true;

            openInvitation.style.opacity = "0.4";


            /* =================================================
               START WEDDING MUSIC
            ================================================= */

            if (weddingMusic) {

                weddingMusic
                    .play()
                    .then(function () {

                        if (musicButton) {
                            musicButton.classList.add(
                                "playing"
                            );
                        }

                    })
                    .catch(function () {

                        console.log(
                            "Music could not autoplay."
                        );

                    });

            }


            /* =================================================
               REVEAL MAIN WEBSITE
            ================================================= */

            setTimeout(function () {

                mainWebsite.classList.remove(
                    "hidden"
                );


                /*
                 * IMPORTANT:
                 *
                 * The website was previously hidden with
                 * display:none.
                 *
                 * Scratch canvases cannot correctly calculate
                 * their size while their parent is hidden.
                 *
                 * Therefore we initialize them AFTER the
                 * website becomes visible.
                 */

                requestAnimationFrame(function () {

                    requestAnimationFrame(function () {

                        initializeScratchCards();

                    });

                });


                /*
                 * Scroll to the main website.
                 */

                setTimeout(function () {

                    mainWebsite.scrollIntoView({
                        behavior: "smooth"
                    });

                }, 50);


            }, 1100);

        }
    );

}


/* =========================================================
   MUSIC CONTROL
========================================================= */

if (musicButton && weddingMusic) {

    musicButton.addEventListener(
        "click",
        function () {

            if (weddingMusic.paused) {

                weddingMusic
                    .play()
                    .then(function () {

                        musicButton.classList.add(
                            "playing"
                        );

                    })
                    .catch(function () {

                        console.log(
                            "Music playback blocked."
                        );

                    });

            }

            else {

                weddingMusic.pause();

                musicButton.classList.remove(
                    "playing"
                );

            }

        }
    );

}


/* =========================================================
   COUNTDOWN
========================================================= */

/*
 * WEDDING COUNTDOWN
 *
 * Date:
 * 30 November 2026
 *
 * Time:
 * 7:30 PM
 *
 * Timezone:
 * India Standard Time (+05:30)
 */

const weddingDate =
    new Date(
        "2026-11-30T19:30:00+05:30"
    );


function updateCountdown() {

    const currentDate =
        new Date();

    let difference =
        weddingDate - currentDate;


    /*
     * Stop at zero after the wedding time.
     */

    if (difference < 0) {

        difference = 0;

    }


    /* =====================================================
       CALCULATE TIME
    ===================================================== */

    const days =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        );


    const hours =
        Math.floor(
            difference /
            (1000 * 60 * 60)
        ) % 24;


    const minutes =
        Math.floor(
            difference /
            (1000 * 60)
        ) % 60;


    const seconds =
        Math.floor(
            difference /
            1000
        ) % 60;


    /* =====================================================
       UPDATE HTML
    ===================================================== */

    const daysElement =
        document.getElementById("days");

    const hoursElement =
        document.getElementById("hours");

    const minutesElement =
        document.getElementById("minutes");

    const secondsElement =
        document.getElementById("seconds");


    if (daysElement) {

        daysElement.textContent =
            String(days).padStart(2, "0");

    }


    if (hoursElement) {

        hoursElement.textContent =
            String(hours).padStart(2, "0");

    }


    if (minutesElement) {

        minutesElement.textContent =
            String(minutes).padStart(2, "0");

    }


    if (secondsElement) {

        secondsElement.textContent =
            String(seconds).padStart(2, "0");

    }

}


/*
 * Run immediately.
 */

updateCountdown();


/*
 * Update every second.
 */

setInterval(
    updateCountdown,
    1000
);


/* =========================================================
   PREMIUM SCRATCH CARDS
========================================================= */

let scratchCardsInitialized = false;


/*
 * We initialize AFTER the main website becomes visible.
 */

function initializeScratchCards() {

    /*
     * Prevent duplicate initialization.
     */

    if (scratchCardsInitialized) {
        return;
    }


    /*
     * Make sure the website is actually visible.
     */

    if (
        !mainWebsite ||
        mainWebsite.classList.contains("hidden")
    ) {

        return;

    }


    const scratchCards =
        document.querySelectorAll(
            ".scratch-card"
        );


    /*
     * Make sure all four cards exist.
     */

    if (
        scratchCards.length === 0
    ) {

        console.warn(
            "No scratch cards found."
        );

        return;

    }


    scratchCardsInitialized = true;


    scratchCards.forEach(
        function (card) {

            setupScratchCard(card);

        }
    );

}


/* =========================================================
   SETUP ONE SCRATCH CARD
========================================================= */

function setupScratchCard(card) {

    const canvas =
        card.querySelector(
            ".scratch-canvas"
        );

    const message =
        card.querySelector(
            ".scratch-message"
        );


    if (!canvas) {

        console.warn(
            "Scratch canvas missing."
        );

        return;

    }


    const context =
        canvas.getContext(
            "2d",
            {
                willReadFrequently: true
            }
        );


    if (!context) {

        console.error(
            "Canvas 2D context unavailable."
        );

        return;

    }


    let isScratching = false;

    let cardRevealed = false;

    let lastCheckTime = 0;

    let scratchedPercentage = 0;

    let currentPointerId = null;


    /* =====================================================
       RESIZE CANVAS
    ===================================================== */

    function resizeCanvas() {

        if (cardRevealed) {
            return;
        }


        const rect =
            card.getBoundingClientRect();


        /*
         * The card must have a real size.
         */

        if (
            rect.width <= 0 ||
            rect.height <= 0
        ) {

            return;

        }


        const devicePixelRatio =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        /*
         * Save the CSS dimensions.
         */

        const width =
            rect.width;

        const height =
            rect.height;


        /*
         * Set real canvas resolution.
         */

        canvas.width =
            Math.round(
                width *
                devicePixelRatio
            );

        canvas.height =
            Math.round(
                height *
                devicePixelRatio
            );


        canvas.style.width =
            width + "px";

        canvas.style.height =
            height + "px";


        /*
         * Scale drawing coordinates so that
         * we can work in CSS pixels.
         */

        context.setTransform(
            devicePixelRatio,
            0,
            0,
            devicePixelRatio,
            0,
            0
        );


        drawScratchSurface(
            width,
            height
        );

    }


    /* =====================================================
       DRAW SCRATCH SURFACE
    ===================================================== */

    function drawScratchSurface(
        width,
        height
    ) {

        context.globalCompositeOperation =
            "source-over";

        context.globalAlpha = 1;


        /*
         * Premium metallic gold gradient.
         */

        const gradient =
            context.createLinearGradient(
                0,
                0,
                width,
                height
            );


        gradient.addColorStop(
            0,
            "#8b6738"
        );

        gradient.addColorStop(
            0.18,
            "#d9bd7e"
        );

        gradient.addColorStop(
            0.38,
            "#f0d99d"
        );

        gradient.addColorStop(
            0.52,
            "#a57d43"
        );

        gradient.addColorStop(
            0.72,
            "#dfc383"
        );

        gradient.addColorStop(
            1,
            "#78552d"
        );


        context.fillStyle =
            gradient;


        context.fillRect(
            0,
            0,
            width,
            height
        );


        /*
         * Metallic diagonal texture.
         */

        context.globalAlpha =
            0.18;


        context.strokeStyle =
            "#fff4d5";

        context.lineWidth =
            1;


        for (
            let x = -height;
            x < width + height;
            x += 13
        ) {

            context.beginPath();

            context.moveTo(
                x,
                0
            );

            context.lineTo(
                x + height,
                height
            );

            context.stroke();

        }


        context.globalAlpha =
            1;


        /*
         * Subtle border.
         */

        context.strokeStyle =
            "rgba(255,245,215,0.55)";

        context.lineWidth =
            1;


        context.strokeRect(
            10,
            10,
            width - 20,
            height - 20
        );


        /*
         * Small decorative stars.
         */

        context.fillStyle =
            "rgba(255,245,215,0.35)";

        context.font =
            "12px serif";

        context.textAlign =
            "center";

        context.textBaseline =
            "middle";


        context.fillText(
            "✦",
            width * 0.15,
            height * 0.18
        );

        context.fillText(
            "✦",
            width * 0.82,
            height * 0.22
        );

        context.fillText(
            "✦",
            width * 0.18,
            height * 0.82
        );

        context.fillText(
            "✦",
            width * 0.84,
            height * 0.78
        );


        /*
         * Reset.
         */

        context.globalCompositeOperation =
            "source-over";

        context.globalAlpha =
            1;

    }


    /* =====================================================
       POINTER POSITION
    ===================================================== */

    function getPointerPosition(event) {

        const rect =
            canvas.getBoundingClientRect();


        return {

            x:
                event.clientX -
                rect.left,

            y:
                event.clientY -
                rect.top

        };

    }


    /* =====================================================
       SCRATCH AT POSITION
    ===================================================== */

    function scratchAt(
        x,
        y
    ) {

        if (cardRevealed) {
            return;
        }


        /*
         * Erase scratch coating.
         */

        context.globalCompositeOperation =
            "destination-out";


        /*
         * Main scratch brush.
         */

        context.beginPath();

        context.arc(
            x,
            y,
            25,
            0,
            Math.PI * 2
        );

        context.fill();


        /*
         * Slightly larger surrounding
         * transparent area.
         */

        context.beginPath();

        context.arc(
            x,
            y,
            14,
            0,
            Math.PI * 2
        );

        context.fill();


        /*
         * Restore normal drawing mode.
         */

        context.globalCompositeOperation =
            "source-over";


        /*
         * Don't calculate percentage on
         * every single pointer event.
         */

        const now =
            performance.now();


        if (
            now - lastCheckTime >
            120
        ) {

            lastCheckTime =
                now;

            checkScratchPercentage();

        }

    }


    /* =====================================================
       SCRATCH BETWEEN TWO POINTS
    ===================================================== */

    function scratchLine(
        startX,
        startY,
        endX,
        endY
    ) {

        if (cardRevealed) {
            return;
        }


        context.globalCompositeOperation =
            "destination-out";


        context.lineWidth =
            50;

        context.lineCap =
            "round";

        context.lineJoin =
            "round";


        context.beginPath();

        context.moveTo(
            startX,
            startY
        );

        context.lineTo(
            endX,
            endY
        );

        context.stroke();


        context.globalCompositeOperation =
            "source-over";

    }


    /* =====================================================
       CHECK SCRATCH PERCENTAGE
    ===================================================== */

    function checkScratchPercentage() {

        if (cardRevealed) {
            return;
        }


        /*
         * Once this has passed 55% we don't
         * need to keep checking.
         */

        if (
            scratchedPercentage >= 55
        ) {

            return;

        }


        const width =
            canvas.width;

        const height =
            canvas.height;


        if (
            width <= 0 ||
            height <= 0
        ) {

            return;

        }


        /*
         * Read canvas pixels.
         */

        let imageData;


        try {

            imageData =
                context.getImageData(
                    0,
                    0,
                    width,
                    height
                );

        }

        catch (error) {

            console.warn(
                "Unable to read scratch canvas.",
                error
            );

            return;

        }


        /*
         * Sample every 8 pixels.
         *
         * This is much faster on mobile.
         */

        const sampleSize =
            8;


        let transparentPixels =
            0;

        let totalPixels =
            0;


        for (
            let y = 0;
            y < height;
            y += sampleSize
        ) {

            for (
                let x = 0;
                x < width;
                x += sampleSize
            ) {

                const index =
                    (
                        y * width +
                        x
                    ) * 4;


                const alpha =
                    imageData.data[
                        index + 3
                    ];


                totalPixels++;


                if (
                    alpha < 100
                ) {

                    transparentPixels++;

                }

            }

        }


        if (
            totalPixels === 0
        ) {

            return;

        }


        scratchedPercentage =
            (
                transparentPixels /
                totalPixels
            ) * 100;


        /*
         * Reveal after 45% of the coating
         * has been scratched.
         */

        if (
            scratchedPercentage >= 45
        ) {

            revealCard();

        }

    }


    /* =====================================================
       REVEAL CARD
    ===================================================== */

    function revealCard() {

    if (cardRevealed) {
        return;
    }

    cardRevealed = true;

    /*
     * Add revealed class to this card.
     * This activates the premium golden glow.
     */
    card.classList.add("revealed");

    /*
     * Fade away the scratch surface.
     */
    canvas.style.opacity = "0";
    message.style.opacity = "0";

    setTimeout(function () {

        canvas.style.display = "none";
        message.style.display = "none";

    }, 700);

}


    /* =====================================================
       POINTER DOWN
    ===================================================== */

    canvas.addEventListener(
        "pointerdown",
        function (event) {

            if (cardRevealed) {
                return;
            }


            event.preventDefault();


            isScratching =
                true;


            currentPointerId =
                event.pointerId;


            /*
             * Keep receiving pointer events even
             * if the finger/mouse moves quickly.
             */

            try {

                canvas.setPointerCapture(
                    event.pointerId
                );

            }

            catch (error) {

                /* Ignore unsupported browsers */

            }


            const position =
                getPointerPosition(event);


            scratchAt(
                position.x,
                position.y
            );

        }
    );


    /* =====================================================
       POINTER MOVE
    ===================================================== */

    canvas.addEventListener(
        "pointermove",
        function (event) {

            if (
                !isScratching ||
                cardRevealed
            ) {

                return;

            }


            if (
                currentPointerId !==
                event.pointerId
            ) {

                return;

            }


            event.preventDefault();


            const position =
                getPointerPosition(event);


            scratchAt(
                position.x,
                position.y
            );

        }
    );


    /* =====================================================
       POINTER UP
    ===================================================== */

    function stopScratching(event) {

        if (
            currentPointerId !== null &&
            event &&
            event.pointerId !== undefined &&
            currentPointerId !==
            event.pointerId
        ) {

            return;

        }


        isScratching =
            false;


        currentPointerId =
            null;

    }


    canvas.addEventListener(
        "pointerup",
        stopScratching
    );


    canvas.addEventListener(
        "pointercancel",
        stopScratching
    );


    canvas.addEventListener(
        "pointerleave",
        function (event) {

            /*
             * With pointer capture active,
             * scratching can continue outside
             * the canvas until pointerup.
             */

        }
    );


    /* =====================================================
       RESIZE
    ===================================================== */

    let resizeTimer;


    window.addEventListener(
        "resize",
        function () {

            if (cardRevealed) {
                return;
            }


            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    function () {

                        resizeCanvas();

                    },
                    150
                );

        }
    );


    /* =====================================================
       INITIALIZE THIS CARD
    ===================================================== */

    resizeCanvas();

}


/* =========================================================
   FALLING GOLD PETALS
========================================================= */

function createPetal() {

    if (!petals) {
        return;
    }


    const petal =
        document.createElement("i");


    petal.classList.add(
        "petal"
    );


    /*
     * Random horizontal position.
     */

    petal.style.left =
        Math.random() * 100 +
        "vw";


    /*
     * Random sideways movement.
     */

    petal.style.setProperty(
        "--petal-x",
        (
            Math.random() *
            220 -
            110
        ) + "px"
    );


    /*
     * Random falling speed.
     */

    petal.style.animationDuration =
        (
            5 +
            Math.random() * 7
        ) + "s";


    /*
     * Random size.
     */

    const size =
        5 +
        Math.random() * 5;


    petal.style.width =
        size + "px";


    petal.style.height =
        (
            size * 1.5
        ) + "px";


    petals.appendChild(
        petal
    );


    /*
     * Remove old petal.
     */

    setTimeout(
        function () {

            petal.remove();

        },
        13000
    );

}


/*
 * Create a new petal every 800ms.
 */

setInterval(
    createPetal,
    800
);

/* =========================================================
   RSVP — GOOGLE SHEETS
========================================================= */

const rsvpForm = document.getElementById("rsvpForm");
const rsvpSubmit = document.getElementById("rsvpSubmit");
const rsvpStatus = document.getElementById("rsvpStatus");

const googleScriptURL =
    "https://script.google.com/macros/s/AKfycby-jaRgd1jR_KLLkuNg9Mk5YKCYLers5FZ3a9hFzKsX2hKjFX4iAMxPJTF_MC8t42E9iQ/exec";


if (rsvpForm) {

    rsvpForm.addEventListener("submit", function (event) {

        event.preventDefault();


        /* Disable button while submitting */

        rsvpSubmit.disabled = true;

        rsvpSubmit.style.opacity = "0.6";

        rsvpStatus.textContent = "Sending your RSVP...";


        /* Collect form data */

        const formData = new FormData(rsvpForm);


        /* Send data to Google Apps Script */

        fetch(googleScriptURL, {

            method: "POST",

            body: formData

        })

        .then(function (response) {

            return response.text();

        })

        .then(function (result) {

            console.log("Google Sheets response:", result);


            if (result.includes("SUCCESS")) {

                rsvpStatus.textContent =
                    "Thank you! Your RSVP has been received. ❤️";

                rsvpStatus.classList.add("success");

                rsvpForm.reset();

            }

            else {

                rsvpStatus.textContent =
                    "Something went wrong. Please try again.";

                rsvpStatus.classList.add("error");

            }

        })

        .catch(function (error) {

            console.error("RSVP Error:", error);

            rsvpStatus.textContent =
                "Unable to send RSVP. Please try again.";

            rsvpStatus.classList.add("error");

        })

        .finally(function () {

            rsvpSubmit.disabled = false;

            rsvpSubmit.style.opacity = "1";

        });

    });

}