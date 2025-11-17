"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Image, Video } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api-client";

export default function CaptionGeneratorForm() {
  const [isVideo, setIsVideo] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tone, setTone] = useState("casual");
  const [length, setLength] = useState("medium");
  const [hashtagCount, setHashtagCount] = useState(5);
  const [captions, setCaptions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Create a reference for the file input
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Function to trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (uploadedFile: File) => {
    const fileType = uploadedFile.type;
    if (
      (isVideo && fileType.startsWith("video/")) ||
      (!isVideo && fileType.startsWith("image/"))
    ) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(uploadedFile);
    } else {
      toast({
        title: "Error",
        description: `Please upload a ${isVideo ? "video" : "image"} file`,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use the API client to generate captions
      const data = await apiClient.generateCaptions(
        file,
        isVideo ? "video" : "image",
        tone,
        length,
        hashtagCount
      );

      setCaptions(data.captions);
      toast({
        title: "Success",
        description: "Captions generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate captions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (captions) {
      try {
        await navigator.clipboard.writeText(captions);
        toast({
          title: "Success",
          description: "Captions copied to clipboard!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy captions",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <section className="py-20 bg-soft-gray">
      <div className="container mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-center text-charcoal"
        >
          Create Captions for Your Content
        </motion.h1>
        <p className="text-center text-slate-gray mb-12">
          Upload your video or image, customize your tone, and get captions
          instantly.
        </p>
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="file-type">File Type</Label>
              <div className="flex items-center space-x-2">
                <Label htmlFor="file-type">Image</Label>
                <Switch
                  id="file-type"
                  checked={isVideo}
                  onCheckedChange={(checked) => {
                    setIsVideo(checked);
                    setFile(null);
                    setPreview(null);
                  }}
                />
                <Label htmlFor="file-type">Video</Label>
              </div>
            </div>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile) {
                  handleFileUpload(droppedFile);
                }
              }}
            >
              {preview ? (
                isVideo ? (
                  <video
                    src={preview}
                    className="max-w-full h-auto mx-auto"
                    controls
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full h-auto mx-auto"
                  />
                )
              ) : (
                <div className="flex flex-col items-center">
                  {isVideo ? (
                    <Video className="w-12 h-12 text-gray-400" />
                  ) : (
                    <Image className="w-12 h-12 text-gray-400" />
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Drag and drop your {isVideo ? "video" : "image"} here, or
                    click to select
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={isVideo ? "video/*" : "image/*"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                onClick={handleUploadClick}
                className="mt-4"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload {isVideo ? "Video" : "Image"}
              </Button>
            </div>

            <div>
              <Label htmlFor="tone">Writing Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Caption Length</Label>
              <RadioGroup
                value={length}
                onValueChange={setLength}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="short" id="short" />
                  <Label htmlFor="short">Short</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="long" id="long" />
                  <Label htmlFor="long">Long</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Number of Hashtags</Label>
              <Slider
                value={[hashtagCount]}
                onValueChange={(value) => setHashtagCount(value[0])}
                max={10}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-slate-gray mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-sky-blue hover:bg-sky-blue/80 text-charcoal"
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Generate Captions"}
            </Button>

            <Textarea
              value={captions}
              placeholder="Your generated captions will appear here..."
              className="h-40"
              readOnly
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCopy}
                disabled={!captions}
              >
                Copy
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
