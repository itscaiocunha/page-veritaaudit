// src/components/CameraModal.tsx
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPictureTaken: (file: File) => void;
}

export const CameraModal = ({ isOpen, onClose, onPictureTaken }: CameraModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  useEffect(() => {
    // Função para iniciar a câmera
    const startCamera = async () => {
      if (isOpen) {
        try {
          // Pede permissão e obtém o stream da câmera
          const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (err) {
          console.error("Erro ao acessar a câmera: ", err);
          alert("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
          onClose(); // Fecha o modal se houver erro
        }
      }
    };

    startCamera();

    // Função de limpeza para parar a câmera quando o modal fechar
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]); // Roda sempre que o estado 'isOpen' mudar

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Define o tamanho do canvas para ser igual ao do vídeo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Desenha o frame atual do vídeo no canvas
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Converte o conteúdo do canvas para um arquivo (Blob)
      canvas.toBlob(blob => {
        if (blob) {
          // Cria um objeto File a partir do Blob
          const pictureFile = new File([blob], "webcam-photo.jpg", { type: "image/jpeg" });
          onPictureTaken(pictureFile); // Envia o arquivo para o componente pai
          onClose(); // Fecha o modal
        }
      }, 'image/jpeg');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-xl text-center">
        <h2 className="text-xl font-bold mb-4">Tirar Foto</h2>
        <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded" />
        {/* O canvas fica escondido, ele serve apenas para processar a imagem */}
        <canvas ref={canvasRef} className="hidden" />
        <div className="mt-4 flex justify-center gap-4">
          <Button onClick={handleCapture} className="bg-green-500 hover:bg-green-600">Capturar</Button>
          <Button onClick={onClose} variant="outline">Cancelar</Button>
        </div>
      </div>
    </div>
  );
};