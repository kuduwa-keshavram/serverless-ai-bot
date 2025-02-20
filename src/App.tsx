import React, { useState, useEffect } from "react";
import { Terminal } from "lucide-react";
import { pipeline, QuestionAnsweringPipeline } from "@huggingface/transformers";

function App() {
  const [textContent, setTextContent] = useState<string>("");
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [currentOutput, setCurrentOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModelLoading, setIsModelLoading] = useState<boolean>();
  const [modelStatus, setModelStatus] = useState<string>("fetching");
  const [charIndex, setCharIndex] = useState<number>(0);
  const [spinnerFrame, setSpinnerFrame] = useState<number>(0);
  const [modelSpinnerFrame, setModelSpinnerFrame] = useState<number>(0);
  const [currentCommand, setCurrentCommand] = useState<string>("");
  const [isTypingCommand, setIsTypingCommand] = useState<boolean>(true);
  const [resumeData, setResumeData] = useState<
    Array<{ command: string; output: string }>
  >([]);
  const [commandHistory, setCommandHistory] = useState<
    Array<{ command: string; output: string }>
  >([]);
  const [userInput, setUserInput] = useState<string>("");
  const [generator, setGenerator] = useState();

  const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  const validFiles = [
    "community-engagement.txt",
    "contact.txt",
    "content-creation.txt",
    "current-role.txt",
    "education.txt",
    "experiences.txt",
    "languages.txt",
    "professional-summary.txt",
    "skills.txt",
    "social.txt",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const files = ["skills.txt", "current-role.txt"];

        const fetchedData = await Promise.all(
          files.map(async (file) => {
            const response = await fetch(`./assets/${file}`);
            return { command: `cat ${file}`, output: await response.text() };
          })
        );

        setResumeData([
          { command: "whoami", output: "Keshavram Kuduwa" },
          ...fetchedData,
          {
            command: 'bot ask -m "What is Keshavram\'s current role?"',
            output: await askBot("What is Keshavram's current role?"),
          },
          {
            command: "help",
            output:
              'Available commands:\n• help - Show this help message\n• clear - Clear the terminal\n• whoami - Display user info\n• cat <file> - Display file contents\n• ls - List available files\n• bot ask -m "<question>" - Ask the bot a question\n• bot pull - Download Keshavram\'s Resume',
          },
        ]);
        console.log("Fetched Data Successfully...");
      } catch (error) {
        console.error("Error fetching resume data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (visibleLines < resumeData.length && isTypingCommand) {
      const currentItem = resumeData[visibleLines];
      if (currentCommand.length < currentItem.command.length) {
        setCurrentOutput("");
        const typingTimer = setTimeout(() => {
          setCurrentCommand(
            currentItem.command.slice(0, currentCommand.length + 1)
          );
        }, 50 + Math.random() * 50);
        return () => clearTimeout(typingTimer);
      } else {
        const startProcessingTimer = setTimeout(() => {
          setIsTypingCommand(false);
          setIsLoading(true);
        }, 200);
        return () => clearTimeout(startProcessingTimer);
      }
    }
  }, [resumeData, visibleLines, currentCommand, isTypingCommand]);

  useEffect(() => {
    if (visibleLines < resumeData.length && !isTypingCommand) {
      setCurrentOutput("");
      setCharIndex(0);

      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(loadingTimer);
    }
  }, [resumeData, visibleLines, isTypingCommand]);

  useEffect(() => {
    let spinnerInterval: number;
    if (isLoading) {
      spinnerInterval = setInterval(() => {
        setSpinnerFrame((prev) => (prev + 1) % spinnerFrames.length);
      }, 80);
    }
    return () => clearInterval(spinnerInterval);
  }, [isLoading]);

  useEffect(() => {
    let spinnerInterval: number;
    if (isModelLoading) {
      spinnerInterval = setInterval(() => {
        setModelSpinnerFrame((prev) => (prev + 1) % spinnerFrames.length);
      }, 80);
    }
    return () => clearInterval(spinnerInterval);
  }, [isModelLoading]);

  useEffect(() => {
    if (!isLoading && !isTypingCommand && visibleLines < resumeData.length) {
      const currentItem = resumeData[visibleLines];
      if (charIndex < currentItem.output.length) {
        const streamTimer = setTimeout(() => {
          setCurrentOutput((prev) => prev + currentItem.output[charIndex]);
          setCharIndex((prev) => prev + 1);
        }, 20);
        return () => clearTimeout(streamTimer);
      } else {
        const nextTimer = setTimeout(() => {
          setVisibleLines((prev) => prev + 1);
          setCurrentCommand("");
          setIsTypingCommand(true);
        }, 500);
        return () => clearTimeout(nextTimer);
      }
    }
  }, [resumeData, isLoading, isTypingCommand, visibleLines, charIndex]);

  const askBot = async (question: string): Promise<string> => {
    try {
      setIsModelLoading(true);
      let context = textContent;
      if (!context) {
        const textResponse = await fetch("./assets/context.txt");
        const textData = await textResponse.text();
        setTextContent(textData);
        context = textData;
      }

      let qaPipeline: QuestionAnsweringPipeline | undefined | null = generator;
      if (!qaPipeline) {
        const newGenerator = await pipeline("question-answering", undefined, {
          progress_callback: (callback) => {
            setModelStatus(callback.status);
          },
        }).catch((err) => {
          console.error("Error loading model:", err);
          return null;
        });
        setGenerator(qaPipeline);
        qaPipeline = newGenerator;
      }
      if (!qaPipeline) return "Error loading the model.";

      const result = await qaPipeline(question, context);

      console.log("Generated Result:", result);

      return result.answer
        ? `Confidence: ${Math.round(result.score * 100)}% | Answer: ${
            result.answer
          }`
        : "No response.";
    } catch (error) {
      console.error("Error loading text file or model:", error);
      return "Unexpected error occurred.";
    } finally {
      setIsModelLoading(false);
    }
  };

  const handleCommand = async (command: string) => {
    let output = "";
    const resumeFile = "Keshavram T. Kuduwa - Technical Lead.pdf";

    if (command === "help") {
      output =
        'Available commands:\n• help - Show this help message\n• clear - Clear the terminal\n• whoami - Display user info\n• cat <file> - Display file contents\n• ls - List available files\n• bot ask -m "<question>" - Ask the bot a question\n• bot pull - Download Keshavram\'s Resume';
    } else if (command === "clear") {
      setCommandHistory([]);
      return;
    } else if (command === "ls") {
      output =
        "community-engagement.txt contact.txt content-creation.txt current-role.txt education.txt experiences.txt languages.txt professional-summary.txt skills.txt social.txt";
    } else if (command.startsWith("cat ")) {
      const fileName = command.split(" ")[1];
      if (validFiles.includes(fileName)) {
        try {
          const response = await fetch(`./assets/${fileName}`);
          output = await response.text();
        } catch (error) {
          output = `cat: ${fileName}: Error reading file`;
        }
      } else {
        output = `cat: ${fileName}: No such file or directory`;
      }
    } else if (command === "whoami") {
      output = resumeData[0].output;
    } else if (command.startsWith('bot ask -m "')) {
      const match = command.match(/bot ask -m "(.*?)"/);
      if (match && match[1]) {
        const question = match[1];
        output = await askBot(question);
      } else {
        output = `Invalid format. Use: bot ask -m "Your question here"`;
      }
    } else if (command === "bot pull") {
      const fileUrl = `./assets/${resumeFile}`;
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = resumeFile;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      output = `Downloading ${resumeFile}...`;
    } else {
      output = `Command not found: ${command}\nType 'help' for available commands.`;
    }

    setCommandHistory((prev) => [...prev, { command, output }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && userInput.trim()) {
      handleCommand(userInput.trim());
      setUserInput("");
    }
  };

  const LoadingAnimation = () => (
    <div className="pl-2 sm:pl-4 flex gap-1">
      <span>{spinnerFrames[spinnerFrame]}</span>
      <span className="text-gray-400">Processing...</span>
    </div>
  );

  const ModelLoadingAnimation = () => (
    <div className="pl-2 sm:pl-4 flex gap-1">
      <span>{spinnerFrames[modelSpinnerFrame]}</span>
      <span className="text-gray-400">
        AI Model Status: {modelStatus.toLocaleUpperCase()} | Processing...
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-green-400 p-2 sm:p-4 font-mono text-sm sm:text-base">
      <div className="mx-auto">
        <div className="flex items-center gap-2 mb-4 bg-gray-900 p-2 rounded">
          <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
          <div className="flex gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {resumeData.slice(0, visibleLines).map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <span className="text-blue-400">portfolio@keshavram</span>
                <span className="text-gray-400">:~$</span>
                <span className="text-white break-all">{item.command}</span>
              </div>
              <div className="whitespace-pre-line pl-2 sm:pl-4 break-words">
                {item.output}
              </div>
            </div>
          ))}

          {visibleLines < resumeData.length ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <span className="text-blue-400">portfolio@keshavram</span>
                <span className="text-gray-400">:~$</span>
                <span className="text-white break-all">{currentCommand}</span>
                {/* <span className="animate-pulse">█</span> */}
              </div>
              {!isTypingCommand && isLoading ? (
                <LoadingAnimation />
              ) : (
                <div className="whitespace-pre-line pl-2 sm:pl-4 break-words">
                  {currentOutput}
                  {!isTypingCommand && !isLoading && (
                    <span className="animate-pulse">█</span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {commandHistory.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <span className="text-blue-400">portfolio@keshavram</span>
                    <span className="text-gray-400">:~$</span>
                    <span className="text-white break-all">{item.command}</span>
                  </div>
                  <div className="whitespace-pre-line pl-2 sm:pl-4 break-words">
                    {item.output}
                  </div>
                </div>
              ))}
              {isModelLoading ? (
                <ModelLoadingAnimation />
              ) : (
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <span className="text-blue-400">portfolio@keshavram</span>
                  <span className="text-gray-400">:~$</span>
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-[150px] bg-transparent text-white outline-none border-none text-sm sm:text-base"
                    autoFocus
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
