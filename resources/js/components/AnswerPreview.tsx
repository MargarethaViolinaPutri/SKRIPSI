import React from 'react';

interface Props {
    codeTemplate: string;
    studentAnswers: string[];
    results: boolean[];
}

export default function AnswerPreview({ codeTemplate, studentAnswers, results }: Props) {
    const parsedCode = codeTemplate?.split(/(____)/g) || [];
    let answerIndex = 0;

    return (
        <div className="bg-gray-800 text-white p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
            {parsedCode.map((part, index) => {
                if (part === '____') {
                    const currentIndex = answerIndex;
                    const studentAnswer = studentAnswers[currentIndex] || '';
                    const isCorrect = results[currentIndex];
                    answerIndex++;

                    const borderColor = isCorrect ? 'border-green-500' : 'border-red-500';
                    const ringColor = isCorrect ? 'focus:ring-green-400' : 'focus:ring-red-400';

                    return (
                        <input
                            key={index}
                            type="text"
                            value={studentAnswer}
                            readOnly
                            className={`inline-block w-40 rounded border-2 bg-gray-600 px-1 py-0.5 text-yellow-300 focus:outline-none ${borderColor} ${ringColor}`}
                        />
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </div>
    );
}
