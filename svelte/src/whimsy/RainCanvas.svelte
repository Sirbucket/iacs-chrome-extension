<script lang="ts">
    import { Rotater3D } from "../util/draw3d";
    import { onMount, onDestroy } from "svelte";
    let walls = [];
    let flakeSize = 32;
    let animating = false;
    let lastAnimation = 0;
    let maxBreeze = 30;
    
    let breeze = {
      vx: 4,
      vy: 5,
    };
  
    function findWalls() {
      walls = [];
      for (let div of document.querySelectorAll(".card")) {
        walls.push(div);
      }
    }
    function isTouchingAny(flake, divs) {
      for (let d of divs) {
        if (isTouchingTop(flake, d)) {
          return true;
        }
      }
      return false;
    }
  
    function isTouchingTop(flake, div: HTMLDivElement) {
      let x = flake.x 
      let y = flake.y 
      let offsetLeft = div.offsetLeft 
      let offsetTop = div.offsetTop 
      let width = div.clientWidth
  
      if (x < 0) {
        return false;
      }
  
      if (x > offsetLeft && x < (offsetLeft + width) && y > (offsetTop - (flakeSize / 2)) && y < (offsetTop + flakeSize)) {
        return true
      }
    }
  
    function removeBroken() {
      flakes = flakes.filter((f) => !f.broken);
    }
  
    onMount(() => {
      setTimeout(startSnow, 1000);
      setTimeout(removeBroken, 3000);
    });
    onDestroy(() => {
      animating = false;
    });
  
    function startSnow() {
      findWalls();
      animating = true;
      makeFlakes();
      requestAnimationFrame(animateSnow);
      updateBreeze();
    }
  
    function updateBreeze() {
      breeze.vx += 10 - Math.random() * 10;
      breeze.vy += 5 - Math.random() * 5 + 15;
      let gustTime = Math.random() * 1000 * 30;
      if (Math.abs(breeze.vx) > maxBreeze) {
        breeze.vx *= 0.8;
      }
      if (Math.abs(breeze.vy) > maxBreeze) {
        breeze.vy *= 0.8;
      }
      console.log("New breeze:", breeze);
      if (animating) {
        setTimeout(updateBreeze, gustTime);
      }
    }
  
    function animateSnow(ts) {
      if (!animating) {
        return;
      }
      let elapsed = 0;
      if (lastAnimation) {
        elapsed = ts - lastAnimation;
      }
      
      lastAnimation = ts;
      flakes.forEach((flake) => updateFlake(flake, elapsed));
      if (animating) {
        requestAnimationFrame(animateSnow);
      }
      let ctx = canvas.getContext("2d");
      canvas.width = window.innerWidth;
      canvas.height = document.querySelector("main").clientHeight;
      canvas.style.width = `${canvas.width}px`;
      canvas.style.height = `${canvas.height}px`;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let rotater = Rotater3D(ctx);
      flakes.forEach((flake) => {
        let x = flake.x 
        let y = flake.y 
        let xangle = flake.xangle 
        let yangle = flake.yangle 
        let angle = flake.angle
        if (flake.y < 0) {
          return;
        }
        rotater.drawAt(
          x,
          y,
          0,
          0,
          angle,
          () => {
            try {
              ctx.drawImage(
                flakeImages[flake.url],
                -flakeSize / 2,
                -flakeSize / 2,
                flakeSize,
                flakeSize
              );
              flake.broken = false;
            } catch (err) {
              flake.broken = true;
            }
          }
        );
      });
    }
  
    function updateFlake(flake, elapsed) {
      canvas.width = window.innerWidth;
    
      if (!flake.vx) {
        flake.vx = 300 + Math.random() * 20;
      }
      if (!flake.vy) {
        flake.vy = 600 - Math.random() * 50;
      }
      if (!flake.vay) {
        flake.vay = Math.random() * 18 - 36;
      }
      if (!flake.vax) {
        flake.vax = Math.random() * 18 - 36;
      }
      if (!flake.yangle) {
        flake.yangle = 0;
      }
      if (!flake.xangle) {
        flake.xangle = 0;
      }

      // Let our z rotation come from our x movement
      flake.angle = -120
      if (isTouchingAny(flake, walls)) {
        flake.y = 0;
      } else {
        flake.y += ((flake.vy + breeze.vy) / 1000) * elapsed;
      }
      flake.x += ((flake.vx + breeze.vx) / 1000) * elapsed;
      if (flake.x > canvas.width) {
        //console.log("flake off canvas, move from ", flake.x);
        flake.x = flake.x % canvas.width;
        //console.log("=>", flake.x);
      }
      while (flake.x < 0) {
        flake.x = canvas.width + flake.x;
      }
      if (flake.y > canvas.height) {
        flake.y = -500 * Math.random();
      }
    }
  
    let urls = [];
    let flakeImages = {};
    let flakes = [];
    function makeFlakes() {
      for (let i = 1; i < 100; i++) {
        urls.push(`/raindrops/drop${~~(Math.max(Math.random() * 3, 1))}.png`);
      }
      flakes = urls.map((u) => ({
        url: u,
        x: Math.random() * 111000,
        y: Math.random() * -10000,
        angle: Math.random() * 90,
        yangle: 0,
        xangle: 0,
      }));
      urls = urls;
    }
    let canvas: HTMLCanvasElement;
  </script>
  
  <canvas bind:this={canvas} />
  <section>
    <!-- snowflake assets-->
    {#each urls as url}
      <img alt="" src={url} bind:this={flakeImages[url]} />
    {/each}
  </section>
  
  <style>
    section {
      display: none;
    }
    canvas {
      width: 100%;
      height: 100%;
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 999999;
    }
  </style>
  