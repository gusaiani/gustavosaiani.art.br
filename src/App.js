import React from "react";
import "./App.css";
import images from "./data/images";

console.log(images);

function App() {
  return (
    <div className="App">
      <h1>Gustavo Saiani</h1>
      <a href="mailto:gs@gustavosaiani.com">gs@gustavosaiani.com</a>
      <header className="App-header">
        {images.data
          .filter(image => image.visible)
          .map((image, index) => (
            <div style={{ marginBottom: "60px" }}>
              <img
                alt={image.name}
                id={image.slug}
                src={`https://s3-sa-east-1.amazonaws.com/gustavosaiani.com/large/${
                  image.filename
                }`}
                loading={index > 1 ? "lazy" : ""}
              />
              <div>
                <p>
                  <b>{image.name}</b>, {image.date}
                </p>
                <p>{image.material}</p>
                <p>
                  {image.height} × {image.width}cm
                </p>
              </div>
            </div>
          ))}
      </header>
    </div>
  );
}

export default App;
