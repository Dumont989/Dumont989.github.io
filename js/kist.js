
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.159.0/examples/jsm/controls/OrbitControls.js';




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

//plaatdikte bepalen
let PlaatDikte;
let MaxOverSpan;

function SterkteFactoren(){

  let Belasting = document.getElementById("Belasting").value;
  
if (Belasting <= 100){
  
   PlaatDikte = 0.018;
   MaxOverSpan = 1;
} 

else if(100 <  Belasting && Belasting <= 250) {
  PlaatDikte = 0.023;
  MaxOverSpan = 0.8;
}

else if (250 <  Belasting) {
  PlaatDikte = 0.032;
  MaxOverSpan = 0.6;
}

   // Update de UI met de nieuwe waarden
   document.getElementById("plaatDikteValue").textContent = PlaatDikte * 1000;
   document.getElementById("maxOverSpanValue").textContent = MaxOverSpan;


}

SterkteFactoren();

let DekselVBreedte;



let kepers = [];
let bodem;
let koppen = [];
let zijkanten = [];
let kopstaanders = [];
let kopregels = [];
let zijkantStaanders = [];
let DekselLiggers = [];
let deksel;




function UpdateKist(){
    //input gebruiker ophalen
    let Lengte = parseFloat(document.getElementById('LengteSlider').value) / 1000;
    let Breedte = parseFloat(document.getElementById('BreedteSlider').value) / 1000 + 2* PlaatDikte;
    let Hoogte = parseFloat(document.getElementById('HoogteSlider').value) / 1000 + 2 * PlaatDikte;
    let KeperAfstand = parseFloat(document.getElementById("KeperAfstandSlider").value) / 1000;
    let KeperAantalIn = parseFloat(document.getElementById("KeperAantal").value);
    let ExplodeFactor = parseFloat(document.getElementById('ExplodeSlider').value)/10;


    document.getElementById("LengteValue").textContent =  (Lengte*1000).toFixed(0);
    document.getElementById("BreedteValue").textContent = (Breedte*1000).toFixed(0);
    document.getElementById("HoogteValue").textContent = (Hoogte*1000).toFixed(0);
    

  // Afmetingen van de kepers
  let KeperLengte = Breedte;
  let KeperHoogte = 0.1;
  let keperBreedte = 0.1;
  let LatBreedte = 0.08;
  let LatDikte = 0.04;
  let LatDikte_18 = 0.018;



    if (ground) scene.remove(ground);
ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({color: 0xD3D3D3}));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
ground.position.y = -Hoogte / 2 - keperBreedte - PlaatDikte/2 - ExplodeFactor;


scene.add(ground);




  //kepers
  // Eerst verwijderen we de oude kepers

  kepers.forEach(beam => scene.remove(beam));
  kepers = [];


  
  

  //start en eindpositie kan via twee manieren gebeuren
  //manueel met een slider of automatische aan de hand van de lengte

  
  // Start- en eindpositie van de kepers op de Z-as
  let startZ;
  let endZ;
  let KeperAantal;

  
  
  if (document.getElementById('KeperAfstandIn').checked == false) {
      KeperAantal = Math.max(2, Math.ceil(Lengte / MaxOverSpan));
  
  
      let keperMargin = 0.1;
  
      // **Pas start- en eindpositie aan op basis van keperMargin**
      startZ = -Lengte / 2 + keperMargin;
      endZ = Lengte / 2 - keperMargin;

  } else {
      KeperAantal = KeperAantalIn;
  
     
  
      startZ = -Math.min(KeperAfstand / 2, Lengte / 2 - (3*keperBreedte)/2);
      endZ = Math.min(KeperAfstand / 2, Lengte / 2 - (3*keperBreedte)/2);
  }
  
  // **Definitieve spacing na het toepassen van keperMargin**
  const beschikbareLengte = endZ - startZ;
  const spacing = (KeperAantal > 1) ? beschikbareLengte / (KeperAantal - 1) : 0;
  
  // Kepers genereren
  for (let i = 0; i < KeperAantal; i++) {
      let zPos = startZ + i * spacing;
  
      let keper = createBoxWithEdges(new THREE.BoxGeometry(KeperLengte, KeperHoogte, keperBreedte), KeperColorMat);
  
      // Positioneren onder de kist
      keper.position.set(0, -Hoogte/2 - KeperHoogte/2 -PlaatDikte/2 -ExplodeFactor, zPos);
  
      // Toevoegen aan de scene en de array
      scene.add(keper);
      kepers.push(keper);
  }
  

 // zijkanten versteveging
 zijkantStaanders.forEach(ZijStaander => scene.remove(ZijStaander));
 zijkantStaanders = [];

 for (let i = 0; i < KeperAantal; i++) {
  let zPos = startZ + i * spacing;

  // Zijstaander links
  let ZijStaanderLinks = createBoxWithEdges(
      new THREE.BoxGeometry(LatDikte_18, Hoogte + 2 * PlaatDikte + KeperHoogte / 2, LatBreedte), 
      LatColorMat
  );
  ZijStaanderLinks.position.set(Breedte / 2 + LatDikte_18 / 2, PlaatDikte / 2 - KeperHoogte / 4, zPos);
  scene.add(ZijStaanderLinks);
  zijkantStaanders.push(ZijStaanderLinks);

  // Zijstaander rechts
  let ZijStaanderRechts = createBoxWithEdges(
      new THREE.BoxGeometry(LatDikte_18, Hoogte + 2 * PlaatDikte + KeperHoogte / 2, LatBreedte), 
      LatColorMat
  );
  ZijStaanderRechts.position.set(-Breedte / 2 - LatDikte_18 / 2, PlaatDikte / 2 - KeperHoogte / 4, zPos);
  scene.add(ZijStaanderRechts);
  zijkantStaanders.push(ZijStaanderRechts);

 
}

function Stapelbaar(){

  if (document.getElementById("Stapelbaar").checked){

    

    DekselVBreedte = Breedte + 2*LatDikte_18;

  } else {

    zijkantStaanders.forEach(ZijStaander => {
      ZijStaander.visible = false;
  });

    
    DekselVBreedte = Breedte;
  }
 
}

Stapelbaar();
  




  // boventkant versteveging
  DekselLiggers.forEach(Ligger => scene.remove(Ligger));
  DekselLiggers = [];

  for (let i = 0; i < KeperAantal; i++) {
    let zPos = startZ + i * spacing;

    let Ligger = createBoxWithEdges(new THREE.BoxGeometry(DekselVBreedte,LatDikte_18,LatBreedte), LatColorMat);

    // Positioneren onder de kist
    Ligger.position.set(0,Hoogte/2 + (3/2)*PlaatDikte + LatDikte_18 / 2, zPos);

    // Toevoegen aan de scene en de array
    scene.add(Ligger);
    DekselLiggers.push(Ligger);

    
}




  if (bodem) scene.remove(bodem);

   //bodem
   bodem = createBoxWithEdges(new THREE.BoxGeometry(Breedte, PlaatDikte, Lengte), OSBColorMat);
   bodem.position.set(0, -Hoogte/2 - ExplodeFactor, 0);
   scene.add(bodem);



   //koppen
   koppen.forEach(kop => scene.remove(kop));
   koppen = [];

    
   for (let i = 0; i < 2; i++) {
    

    let kop = createBoxWithEdges(new THREE.BoxGeometry(Breedte - 2*PlaatDikte, Hoogte, PlaatDikte), OSBColorMat);

        // Positie van de plaat instellen
        let zPositie = ((Lengte/2 - PlaatDikte/2 -LatDikte) + ExplodeFactor);
        if (i === 1) {
            zPositie = -((Lengte/2 - PlaatDikte/2 -LatDikte) + ExplodeFactor); // Maak de z-positie negatief voor de tweede plaat
        }
    
        kop.position.set(0, PlaatDikte / 2, zPositie);


    // Toevoegen aan de scene en de array
    scene.add(kop);
    koppen.push(kop);
}

// Versteviging kop staanders
kopstaanders.forEach(staander => scene.remove(staander));
 kopstaanders = [];

for (let i = 0; i < 4; i++) {
    // Maak een staander
    let staander = createBoxWithEdges(new THREE.BoxGeometry(LatBreedte,Hoogte,LatDikte), LatColorMat);

    // Bepaal de x- en z-positie voor de vier hoeken
    let xPositie = (i === 0 || i === 1) ? (Breedte / 2 - PlaatDikte - LatBreedte/2): -(Breedte / 2 - PlaatDikte - LatBreedte/2);
    let zPositie = (i === 0 || i === 2) ? (Lengte / 2 - LatDikte/2) : -(Lengte / 2 - LatDikte/2);
    
    // Voeg de ExplodeFactor toe aan de zPositie
    zPositie += (i === 1 || i === 2) ? ExplodeFactor : -ExplodeFactor;

    // Positie van de staander instellen
    staander.position.set(xPositie, PlaatDikte / 2, zPositie);

    // Toevoegen aan de scene en de array
    scene.add(staander);
    kopstaanders.push(staander);
}

 // Versteviging kop regels
 kopregels.forEach(regel => scene.remove(regel));
 kopregels = [];

for (let i = 0; i < 4; i++) {
    // Maak een staander
    let regel = createBoxWithEdges(new THREE.BoxGeometry(Breedte-2*PlaatDikte-2*LatBreedte,LatBreedte,LatDikte), LatColorMat);

    // Bepaal de x- en z-positie voor de vier hoeken
    let yPositie = (i === 0 || i === 1) ? (Hoogte/2 - LatBreedte/2 + PlaatDikte/2): -(Hoogte/2 - LatBreedte/2 - PlaatDikte/2 );
    let zPositie = (i === 0 || i === 2) ? (Lengte/2 - LatDikte/2) : -(Lengte/2 - LatDikte/2);
    
    // Voeg de ExplodeFactor toe aan de zPositie
    zPositie += (i === 1 || i === 2) ? ExplodeFactor : -ExplodeFactor;

    // Positie van de staander instellen
    regel.position.set(0, yPositie, zPositie);

    // Toevoegen aan de scene en de array
    scene.add(regel);
    kopregels.push(regel);
}



//zijkanten
zijkanten.forEach(zijkant => scene.remove(zijkant));
   zijkanten = [];


for (let i = 0; i < 2; i++) {
    

  let zijkant = createBoxWithEdges(new THREE.BoxGeometry(PlaatDikte,Hoogte,Lengte), OSBColorMat);

      // Positie van de plaat instellen
      let xPositie = ((Breedte-PlaatDikte)/2 + ExplodeFactor);
      if (i === 1) {
          xPositie = -((Breedte-PlaatDikte)/2 + ExplodeFactor); // Maak de z-positie negatief voor de tweede plaat
      }
  
      zijkant.position.set(xPositie,PlaatDikte/2,0);


  // Toevoegen aan de scene en de array
  scene.add(zijkant);
  zijkanten.push(zijkant);
}


//deksel
if (deksel) scene.remove(deksel);


deksel = createBoxWithEdges(new THREE.BoxGeometry(Breedte, PlaatDikte, Lengte), OSBColorMat);
deksel.position.set(0,Hoogte/2 + PlaatDikte,0);
scene.add(deksel);

}
  















  


// Animatielus voor continue updates
function animate() {
  requestAnimationFrame(animate);
  
  // Update de controls om de camera te bewegen
  controls.update(); // Alleen nodig als enableDamping is ingesteld

  UpdateKist();
  
  // Render de scene
  renderer.render(scene, camera);
}

// Start de animatielus
animate();

window.SterkteFactoren = SterkteFactoren;