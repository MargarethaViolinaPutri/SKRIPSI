export function handleSelectQuestion(
    questionNumber: number,
    generatedQuestions: any[],
    data: any,
    setData: (data: any) => void,
    setActiveQuestion: (num: number) => void,
    setShowCodeTest: (show: boolean) => void,
    setInDetailView: (show: boolean) => void,
) {
    setActiveQuestion(questionNumber);
    setShowCodeTest(true);
    setInDetailView(true);

    const selectedQuestion = generatedQuestions.find((q) => q.question_number === questionNumber);
    if (selectedQuestion) {
        setData({
            ...data,
            test: selectedQuestion.test,
            code: selectedQuestion.kode_utuh,
        });
    }
}
