# `md2blog` - a simple and customisable Markdown blog generator

## What is this, and how does it work?

`md2blog` is a simple and highly customisable Markdown to website generator (i.e. akin to [Docusaurus](https://docusaurus.io/)) designed for quickly creating static and lightweight blog sites.

It is written in NodeJS, and makes use of [Showdown](https://github.com/showdownjs/showdown) for converting Markdown documents to HTML. These documents are then added into a template containg placeholders such as `${TITLE}` and `${CONTENT}`, and are saved as complete HTML files ready for deployment.

## Installation/Usage

Since this is a NodeJS-based application, make sure that you already have it installed. Installation guides for NodeJS can be found on [its website](https://nodejs.org/).

Clone the `md2blog` GitHub repository, then enter the directory and install dependencies:
```
git clone https://github.com/itsmevjnk/md2blog.git
cd md2blog
npm install
```
By default, `md2blog` will get the Markdown files from the `input` directory, use the template stored in the `template` directory to generate the HTML files, and output the resulting files into the `output` directory. This can be changed by specifying their respective environment variables while running `npm start`:
```
MD_INPUT=input MD_TEMPLATE=template MD_OUTPUT=output npm start
```

## Licence
This project is licenced under the MIT licence:

```
Copyright 2024 Thanh Vinh Nguyen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```