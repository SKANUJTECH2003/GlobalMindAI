import { useState, useRef, useEffect } from 'react';
import { VLMWorkerBridge } from '@runanywhere/web-llamacpp';
import { documentAnalysis } from '../../services/documentAnalysis';
import { ModelManager } from '../../services/modelManager';
import { logger } from '../../services/logger';
import './DoubtDestroyer.css';

export function DoubtDestroyer() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [explanation, setExplanation] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup: stop video stream on unmount
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setExplanation('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
        setExplanation('');
        logger.info('Camera started successfully');
      }
    } catch (error) {
      logger.error('Error accessing camera', error);
      setExplanation('❌ Could not access camera:\n\nPlease check that:\n1. Camera permissions are granted\n2. No other app is using the camera\n3. Your device has a camera');
      setIsAnalyzing(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCapturing(false);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsAnalyzing(true);
    setExplanation('Loading Vision AI model...');

    try {
      // CRITICAL: Ensure VLM model is loaded before analysis
      logger.info('Ensuring VLM model is loaded for image analysis');
      try {
        await ModelManager.ensureModelLoaded();
      } catch (modelError) {
        logger.error('Failed to load VLM model', modelError);
        setExplanation('❌ Failed to load Vision AI model.\n\nPlease:\n1. Check your internet connection\n2. Ensure you have enough storage space\n3. Try refreshing the page');
        setIsAnalyzing(false);
        return;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        logger.error('Could not get canvas context');
        setExplanation('❌ Failed to capture image. Please try again.');
        setIsAnalyzing(false);
        return;
      }

      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      setExplanation('Analyzing image...');
      logger.info('Starting image analysis with VLM');

      // Analyze the captured frame with VLM
      const extractedText = await documentAnalysis.analyzeImageDocument(
        imageData,
        'general'
      );

      // Now explain the concept
      setExplanation('Generating explanation...');
      const conceptExplanation = await documentAnalysis.explainConcept(extractedText);
      setExplanation(conceptExplanation);
      logger.info('Image analysis completed successfully');
    } catch (error) {
      logger.error('Analysis error', error);
      setExplanation('❌ Failed to analyze the image.\n\nPossible reasons:\n• Image is too blurry\n• Content is not clear\n• Model encountered an error\n\nPlease try again or ensure the text/diagram is clearly visible.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="doubt-destroyer">
      <div className="dd-header">
        <h2>Doubt Destroyer</h2>
        <p>Point your camera at any text, diagram, or equation and get instant explanations</p>
      </div>

      <div className="dd-content">
        <div className="camera-panel">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="camera-feed"
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <div className="camera-controls">
            {!isCapturing ? (
              <button onClick={startCamera} className="start-camera-btn">
                Start Camera
              </button>
            ) : (
              <>
                <button
                  onClick={captureAndAnalyze}
                  disabled={isAnalyzing}
                  className="capture-btn"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Explain This'}
                </button>
                <button onClick={stopCamera} className="stop-camera-btn">
                  Stop Camera
                </button>
              </>
            )}
          </div>
        </div>

        <div className="explanation-panel">
          <h3>Explanation</h3>
          {isAnalyzing && (
            <div className="analyzing-state">
              <div className="spinner" />
              <p>Analyzing the content...</p>
            </div>
          )}
          {explanation && (
            <div className="explanation-content">
              {explanation}
            </div>
          )}
          {!isAnalyzing && !explanation && (
            <div className="empty-state">
              <p>Capture an image to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
