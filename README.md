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
This project is licenced under the MIT licence.