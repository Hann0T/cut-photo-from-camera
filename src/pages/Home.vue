<script setup>
import { Cropper } from 'vue-advanced-cropper';
import { ref, onMounted, nextTick } from 'vue';
import 'vue-advanced-cropper/dist/style.css';

const coordinates = ref({
    width: 0,
    height: 0,
    left: 0,
    top: 0
});
const cameraSize = ref({
    width: 0,
    height: 0,
});
const image = ref(null);
const cropperCanvas = ref(null);
const videoElement = ref(null);
const canvas = ref(null);
const imgUrl = ref(null);
const isMobile = navigator.userAgentData.mobile;
const cameraFacingUserMode = ref(false);
const facingMode = ref(
     navigator.userAgentData.mobile
        ? 'environment' // to use the back camera on mobile devices
        : 'user'
);
const orientation = ref(screen.orientation);
const container = ref(null);
const fullscreen = ref(false);
const screenDimensions = ref({
    width: 0,
    height: 0
});

onMounted(async () => {
    screenDimensions.value = { width: screen.width, height: screen.height};
    load();
    nextTick(() => {
        canvas.value = cropperCanvas.value.getCanvas();
    });
});

const crop = () => {
    const { coordinates, canvas } = cropperCanvas.value.getResult();
    coordinates.value = coordinates;
    image.value = canvas.toDataURL();
};

const takePhoto = () => {
    let tmpCanvas = document.createElement('canvas');
    let ctx = tmpCanvas.getContext('2d');
    ctx.canvas.width = cameraSize.value.width;
    ctx.canvas.height = cameraSize.value.height;
    ctx.drawImage(videoElement.value, 0, 0, cameraSize.value.width, cameraSize.value.height);
    imgUrl.value = tmpCanvas.toDataURL();
};

const changeCamera = async () => {
    if(videoElement.value.srcObject) {
        videoElement.value.srcObject.getTracks().map(t => t.stop())
    }

    let videoLoaded = null;

    if(facingMode.value == 'user') {
        videoLoaded = await initCamara('environment');
        facingMode.value = 'environment';
    } else {
        videoLoaded = await initCamara('user');
        facingMode.value = 'user';
    }
    videoLoaded.play();
};

const initCamara = async (facingMode) => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode ,
                width: { min: 640, ideal: 1920, max: 1920 },
                height: { min: 400, ideal: 1080, max: 1080 },
            },
        });

        let { width, height } = stream.getTracks()[0].getSettings();
        cameraSize.value = { width, height };
        videoElement.value.srcObject = stream;

        return new Promise((resolve) => {
            videoElement.value.onloadedmetadata = () => {
                resolve(videoElement.value);
                console.log('asdf', cameraSize.value);
            }
        });
  }

  const errorMessage = 'This browser does not support video capture, or this device does not have a camera';
  alert(errorMessage);
  return Promise.reject(errorMessage);
}

const load = async () => {
  const videoLoaded = await initCamara(facingMode.value);
  videoLoaded.play();
  return videoLoaded;
}

screen.orientation.addEventListener("change", function(e) {
    orientation.value = screen.orientation;
    cameraSize.value = { width: cameraSize.value.height, height: cameraSize.value.width };
}, false);

const setFullScreen = async () => {
    fullscreen.value = true;
    await container.value.requestFullscreen();
    screen.orientation.lock('portrait');
};
</script>

<template>
    <section 
        ref="container" 
        class="h-full max-w-7xl mx-auto overflow-hidden bg-white shadow-md sm:rounded-lg flex justify-center items-center flex-col"
    >
        <button 
            @click="setFullScreen" 
            v-if="!fullscreen"
        >
            Fullscreen
        </button>
        <div class="relative h-fit" v-if="!imgUrl">
            <video class="video" playsInline ref="videoElement"></video>
            <div class="absolute bottom-0 right-0 left-0 py-4 flex justify-center bg-[rgba(0,0,0,.3)]">
                <button type="button" @click="takePhoto">
                    <span class="flex justify-center items-center w-[52px] h-[52px] bg-white rounded-full">
                        <span class="flex justify-center items-center w-12 h-12 bg-black rounded-full">
                            <span class="block w-8 h-8 bg-white rounded-full hover:bg-gray-200"></span>
                        </span>
                    </span>
                </button>
                <button 
                    @click="changeCamera"
                    v-if="isMobile"
                    class="relative left-4 text-white shadow-md"
                >
                    <i class="fa-solid fa-camera-rotate"></i>
                </button>
            </div>
            <div class="absolute inset-0 pointer-events-none">
                <span 
                    class="block border-2 border-white mx-auto"
                    :style="{
                        width: isMobile 
                            ? `${screenDimensions.width - screenDimensions.width / 3}px`
                            : `${cameraSize.width - cameraSize.width / 3}px`,
                        height: `${cameraSize.height}px`
                    }"
                >
                </span> 
            </div>
        </div>
        <div v-show="imgUrl" class="flex flex-col justify-center w-full">
            <cropper
                v-show="!image"
                ref="cropperCanvas"
                :src="imgUrl"
                :default-size="{
                    width: cameraSize.width - cameraSize.width / 3,
                    height: cameraSize.height
                }"
            />
            <button 
                v-if="!image"
                type="button" 
                @click="crop" 
                class="flex justify-center items-center bg-gray-200 p-4"
            >
                <span>Crop</span>
            </button>
            <img v-if="image" :src="image" alt="cropped image" />
        </div>
    </section>
</template>
