<script setup>
import { Cropper } from 'vue-advanced-cropper';
import { ref, onMounted, nextTick } from 'vue';
import 'vue-advanced-cropper/dist/style.css';

const HEIGHT = 400;
const WIDTH = HEIGHT / 4 * 3;
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

onMounted(async () => {
    load();
    nextTick(() => {
        canvas.value = cropperCanvas.value.getCanvas();
    });
});

const crop = () => {
    const { coordinates, canvas } = cropperCanvas.value.getResult();
    coordinates.value = coordinates;
    // You able to do different manipulations at a canvas
    // but there we just get a cropped image, that can be used 
    // as src for <img/> to preview result
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

const initCamara = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: navigator.userAgentData.mobile 
                ? {
                    exact: 'environment' // to use the back camera on mobile devices
                }
                : 'user',
            },
        });

        let { width, height } = stream.getTracks()[0].getSettings();
        cameraSize.value = { width, height };
        videoElement.value.srcObject = stream;

        return new Promise((resolve) => {
            videoElement.value.onloadedmetadata = () => {
                resolve(videoElement.value);
            }
        });
  }

  const errorMessage = 'This browser does not support video capture, or this device does not have a camera';
  alert(errorMessage);
  return Promise.reject(errorMessage);
}

const load = async () => {
  const videoLoaded = await initCamara()
  videoLoaded.play()
  return videoLoaded;
}
</script>

<template>
    <section class="min-h-screen max-w-7xl mx-auto bg-white overflow-hidden shadow-md sm:rounded-lg flex justify-center">
        <div class="relative h-fit" v-if="!imgUrl">
            <video class="video" playsInline ref="videoElement"></video>
            <div class="absolute bottom-4 right-0 left-0 flex justify-center">
                <button type="button" @click="takePhoto">
                    <span class="flex justify-center items-center w-[52px] h-[52px] bg-white rounded-full">
                        <span class="flex justify-center items-center w-12 h-12 bg-black rounded-full">
                            <span class="block w-8 h-8 bg-white rounded-full hover:bg-gray-200"></span>
                        </span>
                    </span>
                </button>
            </div>
        </div>
        <div v-show="imgUrl" class="flex flex-col justify-center w-full">
            <cropper
                v-show="!image"
                ref="cropperCanvas"
                :src="imgUrl"
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
