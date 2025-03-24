import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import osbImage from '../img/OSB.jpg';
import KEPERImage from '../img/KEPER.jpg';

// Het container-element van de pagina
var container = document.getElementById('canvas');

// De scene
var scene = new THREE.Scene();
scene.background = new THREE.Color('white');

// Camera die de grootte van de container gebruikt
var camera = new THREE.PerspectiveCamera(70, 1080 / 720, 0.1, 1000);
camera.position.set(1, 1, 1);
camera.lookAt(scene.position);

// Renderer die de grootte van de container gebruikt en daarin wordt geplaatst
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(1080, 720); // Pas de grootte van de canvas aan op het scherm
container.appendChild(renderer.domElement);

// OrbitControls instellen
var controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Schakel demping in voor soepelere beweging
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;


// Verlichting toevoegen
const ambientLight = new THREE.AmbientLight(0xf6cd8b, 2.0);
const light = new THREE.DirectionalLight(0xFFFFFF, 2.0);
light.position.set(2.5, 5, 5);
light.castShadow = true;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 50;
light.shadow.camera.left = -10;
light.shadow.camera.right = 10;
light.shadow.camera.top = 10;
light.shadow.camera.bottom = -10;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Dit zorgt voor zachte schaduwen
scene.add(ambientLight, light);

//schaduwvlak
let ground;

// Voeg een axis helper toe
//scene.add(new THREE.AxesHelper(2));


// Materialen
const OSBColorMat = new THREE.MeshStandardMaterial({ color: 0x1b7101 });
const KeperColorMat = new THREE.MeshStandardMaterial({ color: 0x8e6103 });
const LatColorMat = new THREE.MeshStandardMaterial({ color: 0x6d4c08 });


const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });


// Functie om een object met randen te maken
function createBoxWithEdges(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, edgeMaterial);
    mesh.add(line);
    return mesh;
}



//onderdelen
let blokken= [];
let onderlatten= [];
let tussenlatten= [];
let bovenlatten= [];
let plaat;





function UpdatePallet(){

 //input gebruiker ophalen
 let Lengte = parseFloat(document.getElementById('LengteSlider').value) / 1000;
 let Breedte = parseFloat(document.getElementById('BreedteSlider').value) / 1000;
 let AantalOnderLatten = parseFloat(document.getElementById("onderlatslider").value);
 let AantalTussenLatten = parseFloat(document.getElementById("Tussenlatslider").value);
 let AantalBovenlatten = parseFloat(document.getElementById('BovenLatten').value);
 let BovenLatSpreiding = parseFloat(document.getElementById("Spreiding").value / 1000);
 let ExplodeFactor = parseFloat(document.getElementById('ExplodeSlider').value)/10;

 

 document.getElementById("LengteValue").textContent =  (Lengte*1000).toFixed(0);
 document.getElementById("BreedteValue").textContent = (Breedte*1000).toFixed(0);
 document.getElementById("TussenlatValue").textContent = (AantalTussenLatten).toFixed(0);
 document.getElementById("OnderlatValue").textContent = (AantalOnderLatten).toFixed(0);


//belangrijke afmetingen
let blokHoogte = 0.1;
let blokBreedte = 0.08;
let LatBreedte = 0.075;
let LatHoogte = 0.020;
let PlaatDikte = 0.018


// Eerst verwijderen we de oude onderdelen
onderlatten.forEach(lat => scene.remove(lat));
tussenlatten.forEach(lat => scene.remove(lat));
bovenlatten.forEach(lat => scene.remove(lat));
blokken.forEach(blok => scene.remove(blok));
if (plaat) scene.remove(plaat);
onderlatten = [];
tussenlatten = [];
bovenlatten = [];
blokken = [];

// Onderlatten genereren
let startZ = -Breedte / 2;
let spacingZ = Breedte / (AantalOnderLatten - 1);

for (let i = 0; i < AantalOnderLatten; i++) {
    let zPos = startZ + i * spacingZ;
    let onderlat = createBoxWithEdges(new THREE.BoxGeometry(Lengte +  blokBreedte, LatHoogte, LatBreedte), KeperColorMat);
    onderlat.position.set(0, 1*ExplodeFactor, zPos);
    scene.add(onderlat);
    onderlatten.push(onderlat);
}

// Blokken genereren op een grid
let startX = -Lengte / 2;
let spacingX = Lengte / (AantalTussenLatten - 1);

for (let i = 0; i < AantalTussenLatten; i++) {
    for (let j = 0; j < AantalOnderLatten; j++) {
        let xPos = startX + i * spacingX;
        let zPos = startZ + j * spacingZ;

        let blok = createBoxWithEdges(new THREE.BoxGeometry(blokBreedte, blokHoogte, blokBreedte), KeperColorMat);
        blok.position.set(xPos, LatHoogte / 2 + blokHoogte / 2 + 1.2*ExplodeFactor, zPos);
        scene.add(blok);
        blokken.push(blok);
    }
}

// tussenlatten genereren
startX = -Lengte / 2;
spacingX = Lengte / (AantalTussenLatten - 1);

for (let i = 0; i < AantalTussenLatten; i++) {
    let xPos = startX + i * spacingX;
    let tussenlat = createBoxWithEdges(new THREE.BoxGeometry(LatBreedte, LatHoogte, Breedte + blokBreedte), KeperColorMat);
    tussenlat.position.set(xPos, blokHoogte + LatHoogte + 1.4*ExplodeFactor, 0);
    scene.add(tussenlat);
    tussenlatten.push(tussenlat);
}





//dek opties bepalen


//vol met planken
if(document.getElementById('Vol').checked){
   
 //bovenlatten generenen
startZ = -Breedte/2;
let endZ = Breedte/2;

let AantalBovenlatten = Math.max(2, Math.ceil(Breedte / LatBreedte));
  
  //spacing
  const beschikbareLengte = endZ - startZ;
  const spacing = (AantalBovenlatten > 1) ? beschikbareLengte / (AantalBovenlatten - 1) : 0;
  

  for (let i = 0; i < AantalBovenlatten; i++) {
      let zPos = startZ + i * spacing;
  
      let bovenlat = createBoxWithEdges(new THREE.BoxGeometry(Lengte + blokBreedte, LatHoogte, LatBreedte), KeperColorMat);
  
      // Positioneren onder de kist
      bovenlat.position.set(0,blokHoogte + 2*LatHoogte + 1.6*ExplodeFactor, zPos);
  
      // Toevoegen aan de scene en de array
      scene.add(bovenlat);
      bovenlatten.push(bovenlat);
  }


//plaat als dek
} else if(document.getElementById('Plaat').checked){


      plaat = createBoxWithEdges(new THREE.BoxGeometry(Lengte + blokBreedte,PlaatDikte,Breedte + blokBreedte), KeperColorMat);
  
      // Positioneren onder de kist
      plaat.position.set(0,blokHoogte + (3/2)*LatHoogte + PlaatDikte/2 + 1.6*ExplodeFactor,0);
  
      // Toevoegen aan de scene en de array
      scene.add(plaat);
   
  

//spreiding van aantal latten over dek
} else if(document.getElementById('spreiding').checked){

  
    let startZ = -Breedte / 2;
    let endZ = Breedte / 2;


    const beschikbareLengte = endZ - startZ;
    const spacing = (AantalBovenlatten > 1) ? beschikbareLengte / (AantalBovenlatten - 1) : 0;
    
  
    for (let i = 0; i < AantalBovenlatten; i++) {
        let zPos = startZ + i * spacing;
    
        let bovenlat = createBoxWithEdges(new THREE.BoxGeometry(Lengte + blokBreedte, LatHoogte, LatBreedte), KeperColorMat);
    
        // Positioneren onder de kist
        bovenlat.position.set(0,blokHoogte + 2*LatHoogte + 1.6*ExplodeFactor, zPos);
    
        // Toevoegen aan de scene en de array
        scene.add(bovenlat);
        bovenlatten.push(bovenlat);
    }

}


}



























  


// Animatielus voor continue updates
function animate() {
  requestAnimationFrame(animate);
  
  // Update de controls om de camera te bewegen
  controls.update(); // Alleen nodig als enableDamping is ingesteld

  UpdatePallet();
  
  // Render de scene
  renderer.render(scene, camera);
}

// Start de animatielus
animate();

