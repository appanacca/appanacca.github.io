const myHeading = document.querySelector('h1');
// myHeading.textContent = 'Dynamically writtent title';

document.querySelector('body').onclick = function() {
    alert('Ouch! Stop poking me!');
}

let myImage = document.querySelector('img');

myImage.onclick = function() {
    let mySrc = myImage.getAttribute('src');
    if(mySrc === 'images/1.jpg') {
      myImage.setAttribute('src', 'images/2.jpg');
    } else {
      myImage.setAttribute('src','images/1.jpg');
    }
}

let myButton = document.querySelector('button');

function setUserName() {
    let myName = prompt('Please enter your name ')
    localStorage.setItem('name', myName)
    myHeading.textContent = myName
}

if(!localStorage.getItem('name')) {
    setUserName();
  } else {
    let storedName = localStorage.getItem('name');
    myHeading.textContent = storedName;
  }

myButton.onclick = function() {
    setUserName()
}