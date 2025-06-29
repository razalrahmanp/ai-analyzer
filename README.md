# AI Image Analyzer 🖼️🤖

A modern React app that uses [Transformers.js](https://huggingface.co/docs/transformers.js) to run **image classification directly in the browser**, powered by the [Xenova ViT model](https://huggingface.co/Xenova/vit-base-patch16-224).

## ✨ Features

✅ Upload images from your device or paste a URL  
✅ Real-time image classification (top-5 labels)  
✅ Animated progress indicators  
✅ Clean Tailwind CSS UI  
✅ No server required—runs fully in the browser  

---

## 🚀 Live Demo

👉 **[Coming Soon / your deployment URL]**

---

## 🛠️ Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-image-analyzer.git
cd ai-image-analyzer
````

### 2. Install dependencies

Make sure you have **Node.js >= 16** installed.

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) (or the port shown in your console).

---

## ⚙️ Build for production

```bash
npm run build
```

Then preview the production build:

```bash
npm run preview
```

---

## 🧠 Model Details

This app uses the **ViT Base Patch16 224** model quantized for browser use:

* Model: [`Xenova/vit-base-patch16-224`](https://huggingface.co/Xenova/vit-base-patch16-224)
* Pipeline: `image-classification`
* Runs entirely in the browser via WebAssembly and ONNX.

---

## 🖇️ Project Structure

```
src/
  App.tsx         # Main React component
  main.tsx        # Entry point
  index.css       # Tailwind styles
```

---

## 🪧 Notes

* For **security reasons**, some image URLs (e.g., protected or CORS-restricted) cannot be loaded. In those cases, download the image and use **Upload from Device**.
* First load may take \~15–30 seconds to download and initialize the model.

---

## 🧑‍💻 Contributing

Pull requests and issues are welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

* [Transformers.js](https://github.com/xenova/transformers.js)
* [Hugging Face](https://huggingface.co/)
* [Tailwind CSS](https://tailwindcss.com/)

```

---

### ✨ Tips:
- **Update the repository URL** in the clone instructions.
- **Add a screenshot** at the top if you want (e.g., `![Screenshot](./screenshot.png)`).
- **Fill in the live demo link** if you deploy to Vercel or Netlify.

If you’d like, I can also help you prepare a **`package.json`**, **Vercel config**, or any other docs!
```

    },
  },
])
```
