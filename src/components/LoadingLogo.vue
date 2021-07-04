<template>
  <svg
    class="absolute logo"
    width="100%"
    height="100%"
    viewBox="0 0 60 60"
    xmlns="http://www.w3.org/2000/svg"
    xml:space="preserve"
  >
    <g transform="matrix(1.01695,0,0,1.01463,301.017,35.5122)">
      <g
        transform="matrix(0.08453,0.0653504,-0.064864,0.0851639,-275.19,-46.394)"
      >
        <path
          class="line1"
          d="M256.033,92.215C260.62,73.311 277.547,60 297,60C316.453,60 333.38,73.311 337.967,92.215L359.867,182.471L452.473,175.409C471.87,173.93 489.76,185.915 495.771,204.415C501.782,222.916 494.353,243.128 477.792,253.332L398.721,302.051L434.054,387.942C441.455,405.932 435.585,426.65 419.847,438.085C404.109,449.519 382.591,448.699 367.769,436.102L297,375.956L226.231,436.102C211.409,448.699 189.891,449.519 174.153,438.085C158.415,426.65 152.545,405.932 159.946,387.942L195.279,302.051L116.208,253.332C99.647,243.128 92.218,222.916 98.229,204.415C104.24,185.915 122.13,173.93 141.527,175.409L234.133,182.471L256.033,92.215Z"
          fill-opacity="0"
        ></path>
      </g>
      <g transform="matrix(0.106549,0,0,0.107348,-299.178,-32.9525)">
        <path
          class="line2"
          d="M256.033,92.215C260.62,73.311 277.547,60 297,60C316.453,60 333.38,73.311 337.967,92.215L359.867,182.471L452.473,175.409C471.87,173.93 489.76,185.915 495.771,204.415C501.782,222.916 494.353,243.128 477.792,253.332L398.721,302.051L434.054,387.942C441.455,405.932 435.585,426.65 419.847,438.085C404.109,449.519 382.591,448.699 367.769,436.102L297,375.956L226.231,436.102C211.409,448.699 189.891,449.519 174.153,438.085C158.415,426.65 152.545,405.932 159.946,387.942L195.279,302.051L116.208,253.332C99.647,243.128 92.218,222.916 98.229,204.415C104.24,185.915 122.13,173.93 141.527,175.409L234.133,182.471L256.033,92.215Z"
          fill-opacity="0"
        ></path>
      </g>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'LoadingLogo',
}
</script>

<style>
.logo {
  animation: rotating 3.2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

.line1 {
  fill: #5f1b40;
  stroke: rgb(127, 30, 83);
  stroke-linejoin: round;
  stroke-linecap: round;
  stroke-width: 50px;
  fill-opacity: 1;
  stroke-dasharray: 2620.61;
  stroke-dashoffset: 6190.61;
  animation: keyframeLine1 4s linear infinite;
}

.line2 {
  animation: keyframeLine2 3s linear infinite;
  fill: rgb(215, 31, 131);
  fill-opacity: 0.4;
  stroke: rgb(215, 31, 131);
  stroke-linejoin: round;
  stroke-width: 27px;
  stroke-linecap: round;
  stroke-miterlimit: 5;
  stroke-dasharray: 2620.61;
  stroke-dashoffset: 6190.61;
}

@keyframes keyframeLine1 {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes keyframeLine2 {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
