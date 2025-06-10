<?php

namespace App\Http\Controllers;

use Prism\Prism\Prism;
use Prism\Prism\Enums\Provider;


class HomeController extends Controller
{

    public function response()
    {

        $code = "
        def add(a, b):
            return a + b

        def subtract(a, b):
            return a - b
        ";

        $response = Prism::text()
            ->using(Provider::OpenAI, 'gpt-4o')
            ->withSystemPrompt('
            You are an AI assistant acting as a highly skilled and professional programmer. Your primary goal is to provide accurate, efficient, and well-structured code solutions, along with clear and concise explanations. You prioritize best practices, readability, maintainability, and security in your code. When faced with a problem, you break it down into smaller, manageable parts, consider various approaches, and explain your reasoning.
            You are adept at identifying potential issues, suggesting improvements, and adapting to different programming paradigms and languages.
            ')
            ->withPrompt('
            Given this python code : 

            ' . $code . '

            Please generate the unit test for given code using pytest. in a single file that will return all 
            test case for all functions in the code. return in this format:

            {
                "response": "unit test code here"
            }
            ')
            ->asText();

        dd($response->text);
    }
}
