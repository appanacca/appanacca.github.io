+++ 
title = "A primer on Python CLIs"
date = "2022-12-22"
author = "Nicola" 
+++

{{<image src="/img/python.jpg"
    alt="Me thinking"
    position="center"
    style="border-radius: 6px"
    caption="."
    captionPosition="right"
    captionStyle="color: red">}}

# Intro

Command line arguments (CLI)__ are a tool that we can use to parametrize our application whitout the need of any code modification.
Imagine that you have written a nice application, that takes several parameters in input and you want to be able to change them when the programm is
started by the user.
As a junior developper I find myself using some very bad approaches to store local arguments to pass
to my application, such as global variables inside the application code.

When I have started programming as a fulltime job I have seen that my struggles were shared by some other junior colleagues;
expecially if, like me, they do not come from a computer science background.

As usual in the python ecosystem there are a lot of libraries which can be used and the pro/cons can be not obvious at first glance.
In the following I will use a simple image resizing applicaton to illustrate how to write the CLI interface using some common python libraries.
I will share some tougts about each implementation and hopefully, this post will save some problemes to someone
that approaches the topic for the first time.

## Application

Lat's start with the implementation of the image resizing functionality
This is pretty straightforward to implement with the PIL library:

{{< code language="python" title="Resize function" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
from PIL import Image

def resize(image_path: str, width: int, heigth: int, output_path: str) -> None:
    img = Image.open(image_path)
    img_resized = img.resize((width, heigth)).convert('RGB')
    img_resized.save(output_path, "JPEG")
{{< /code >}}

    The convert('RGB') part is needed to work well with input 
        images that have an alpha channel.

Here below the results of our resizing function on reddit avatar:

{{<figure src="/img/reddit.png"
    alt="Me thinking"
    position="center"
    style="border-radius: 6px"
    caption="Original Image"
    captionPosition="left"
    captionStyle="color: black">}}

{{<figure src="/img/reddit_small.png"
    alt="Me thinking"
    position="center"
    style="border-radius: 6px"
    caption="Resized image"
    captionPosition="left"
    captionStyle="color: black">}}

## Why do I need a CLI?

The above application takes several inputs from the user in order to work. So the developper has to figure out a way to make the user fill up these parameters.
A common antipattern is to use the same file of the application to add global variables.
Look if this seems familiar to you:

{{< code language="python" title="Resize function" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
if __name__ == "__main__":

  IMG = "/home/image.jpg"
  OUT =  "/home/out_image.jpg"
  SIZE = (256, 128)

  resize(IMG, SIZE, OUT)
{{< /code >}}

In this example the inputs to the function call are put directly in the same file as the application code. 
This means that in order to modify any parameters the application code should be accessible by the end user.
But this is not very practical since we usually share application with PIP, conda or any other package manager that you like.
There are several good ways to avoid the solution above and make the application more accessible one of which is to 
provide a command line, so let's see how to implement it.

## What is a CLI ?

I suppose that any reader had executed the following command at least once:

{{< code language="bash" title="Resize function" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
git clone https://github.com/pallets/click.git
{{< /code >}}

    This is the git command that permits us to clone and download a github repository from its git server.

The command above is a typical example of a CLI, that is simply a very friendly way to process command options in the form of lines of text. Let' break down some common terminology:

* __git:__ is a command. It is basically the name of the main program / application to be run.
* __clone:__is a subcommand. An application can have many subcommands. Think about git commit, git push, git fetch etc...
* __github.com/pallets/click.git:__ is a argument or positional argument. It is passed to the subcommand as a parameter.

Look at this other example:

{{< code language="bash" title="Resize function" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
git commit -m "a very well written message"
{{< /code >}}

* __git:__  command
* __commit__: subcommand
* __-m__:  name of the parameter, option in CLI terminology
* __a very well written message__:  value of the parameter (or option)


In this case the parameter is passed by specifyng his name instead of relying just on his position.

Think about a function call in which you use positional arguments versus a keyword argument. In the CLI case it is exactly the same.


{{< code language="python" title="Positional VS Keyword" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
# positional
resize("/home/image.jpg", 256, 128, "/home/out_image.jpg")

# keyword
resize(heigth=256, width=128, output_path="/home/out_image.jpg", image_path="/home/image.jpg")
{{< /code >}}

In few words a CLI is just a way to pass parameters to a command (or subcommand). It is important to keep in mind that parameters come in two different flavors:

* __CLI arguments:__it is the equivalent of a positional argument, so you just put it after the command
* __CLI options:__think of a keyword argument. In order to pass it to the command you have to specify its name
usually prefixed with one (-) or two dashes (--)

Writing a good CLI means also to choose between these two different ways to pass parameters. A good CLI library gave the developper the choice between pass the parameters as options or arguments. But there are also other general capabilities that you want from a library:

* __help:__the CLI should provide an helper function (that is usually invoked by __--help__ or __-h__) that helps the user to 
figure out what is the meaning of all the parameters and the command itself
* __short names:__options parameters are always prefixed with their names, like __--input__. However of the name is
particularly long you want to provide the user the possibility to use a shortname, like __-i__ instead of like __--input__
* __default values:__ sometimes the application can be run with a pre-defined set of parameters and the user has to 
override theme very rarely

These are just the bare minimum requirements for a CLI library. However CLIs can be very complex and their design should be thougth carefully if you want the user to engage in your application. For the readers that wants to know more please have a look at this [excepional blog](https://clig.dev/#foreword) about the CLI design, not only in python but seen from a more broad viewpoint

## Common Python Libraries

Now is time to dive into implementing CLI in varius python libraries.</p>

#### Argparse

Argparse is the CLI library that is included in the python standard library. This is whay it is considered the de facto standard by most python developpers.
Let's look at what the implementation look like:


{{< code language="python" title="Argparse implementation" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
import argparse
from app import resize


parser = argparse.ArgumentParser(description='Resize an image.')
parser.add_argument("-i", "--input",
                    help="Input image path",
                    type=str,
                    required=True)
parser.add_argument("--heigth",
                    help="Height of the output image",
                    type=int,
                    default=256)
parser.add_argument("--width",
                    help="Width of the output image",
                    type=int,
                    default=256)
parser.add_argument("-o", "--output",
                    help="Output image path",
                    type=str,
                    required=True)


if __name__ == "__main__":
    cli_args = parser.parse_args()
    resize(cli_args.input, cli_args.heigth, cli_args.width, cli_args.output)
{{< /code >}}


As you can see it is pretty easy to implement a CLI. You just instanciate an ArgumentParser object that permits you to register arguments.
    Then you use the same object with a dict-like syntax to retrieve the values of passed after the CLI parsing.
    The library is easy to use and support out of the box types specifications, default values, requirements and help messages.
    Actually you get also a pretty neat --help command that formats your help message for you.


{{< code language="python" title="Help output" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
python  argparse_example.py --help

usage: argparse_example.py [-h] -i INPUT [--heigth HEIGTH] [--width WIDTH] -o
      OUTPUT

Resize an image.

optional arguments:
-h, --help            show this help message and exit
-i INPUT, --input INPUT
   Input image path
--heigth HEIGTH       Height of the output image
--width WIDTH         Width of the output image
-o OUTPUT, --output OUTPUT
   Output image path
Usage: click_example.py [OPTIONS]

Resize an image.

Options:
-i, --input TEXT   Input image path  [required]
-o, --output TEXT  Output image path  [required]
--heigth INTEGER   Height of the output image
--width INTEGER    Width of the output image
--help             Show this message and exit.
{{< /code >}}
  
From a stylistic point of view I always avoid using positional arguments, instead I use only named parameters

  From a stylistic point of view I always avoid using positional arguments, instead I use mostly named parameters.
  It is a 100% opinionated choice so feel free to think otherwise.
  But in my experience if your application needs more than one parameter you better use keywords to specify all the 
  parameters to avoid mistakes in their order. Compare the following two implementations:

{{< code language="bash" title="Keyword" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
python  argparse_example.py -i reddit.jpg --heigth 100 --width 50 -o reddit_resize.jpg
{{< /code >}}

{{< code language="bash" title="Positional" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
python  argparse_example.py reddit.jpg  100  50 reddit_resize.jpg
{{< /code >}}

Which is the clearest in your opinion? In the first one avery parameter is names and you are free to switch their order without any confusion.
In the second you better remenber that the second parameter is the __heigth__ and the third is the __width__ because if you switch them 
you will end up with an image that has the opposite aspect ratio of the one that you had request.

##### Click

Click is another very common CLI library that you can find in varius projects. The idea beyond the library is to use decorators to naturally extend a function with a CLI interface.


{{< code language="python" title="Click implementation" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
import click
from PIL import Image


@click.command()
@click.option("-i", "--input",
                    help="Input image path",
                    type=str,
                    required=True)
@click.option("-o", "--output",
                    help="Output image path",
                    type=str,
                    required=True)
@click.option("--heigth",
                    help="Height of the output image",
                    type=int,
                    default=256)
@click.option("--width",
                    help="Width of the output image",
                    type=int,
                    default=256)
def resize(input: str, heigth: int, width: int, output: str) -> None:
    """Resize an image."""
    img = Image.open(input)
    img_resized = img.resize(width, heigth).convert('RGB')
    img_resized.save(output, "JPEG")


if __name__ == "__main__":
    resize()
{{< /code >}}

As you cas see in this case the decorators usage is used to natural extend the function. 
The syntax for the various arguments is very similar to argparse, what does it change is the way you apply it to the application code and how the 
parameters are retrieved.
However, what about if you want to separate the application from the CLI, like implement them in separate namespaces and file.

In this case you have to use a cli function that encapsulate the "real" application function call.
This is like a pattern that emerge if you have the "resize" function 
declared in another file/module. Here you have an example:



{{< code language="python" title="Click encapsulation" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
import click
from app import resize


@click.command()
@click.option("-i", "--input",
                    help="Input image path",
                    type=str,
                    required=True)
@click.option("-o", "--output",
                    help="Output image path",
                    type=str,
                    required=True)
@click.option("--heigth",
                    help="Height of the output image",
                    type=int,
                    default=256)
@click.option("--width",
                    help="Width of the output image",
                    type=int,
                    default=256)
def cli(input, heigth, width, output):
    """Resize an image."""
    resize(input, heigth, width, output)


if __name__ == "__main__":
    cli()
{{< /code >}}


As for argparse the __--help__ option is already implemented and you get a very good results.


{{< code language="python" title="Click Help" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
python  click_example.py --help
Usage: click_example.py [OPTIONS]

Resize an image.

Options:
  -i, --input TEXT   Input image path  [required]
  -o, --output TEXT  Output image path  [required]
  --heigth INTEGER   Height of the output image
  --width INTEGER    Width of the output image
  --help             Show this message and exit.
{{< /code >}}


It also worth noting that Click comes with no dependency on his own. I have to admit that this is my favourite library at the moment because it avoids the use of an intermidiate object like in argparse and the decorators feet perfectly their purpose in this case.


##### Typer

Typer is one of the new kid in town concerning CLI libraries but it is gaining traction and comes from the same creators
    of the FastAPI project, that is also a great project if you are into web developpement. Here below is my CLI implementation:

{{< code language="python" title="Typer implementation" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
import typer
from PIL import Image


def resize(input: str = typer.Option(..., "-i", help="Input image path"),
            heigth: int = typer.Option(256, help="Height of the output image"), 
            width: int  = typer.Option(256, help="Width of the output image"), 
            output: str  = typer.Option(..., "-o", help="Output image path")) -> None:
    """Resize an image."""
    img = Image.open(input)
    img_resized = img.resize(width, heigth).convert('RGB')
    img_resized.save(output, "JPEG")


if __name__ == "__main__":
    typer.run(resize)
{{< /code >}}


The idea behind the library is to use type annotations to specify the CLI interface. In this way some of the informations, like the name of the variables, are directly taken into account so you have less redundant code to write. It also explicitely make the difference between CLI keyword arguments, named __Option__, and CLI positional arguments, named __Arguments__. I happen to like this approch but, I have to pinpoint some possible issues:

* __type hints can be hard: __ not all developpers are familiar with the type hints so the syntax can seems complex at first.
* __user friendlyness: __ the documentation is great, really really great but, it took me more time than I want to admit to figure out a simple example like this one. It was the first time that I used the library so a little bit of learning curve is normal however, in my opinion, the CLI code in this code is less obvious and readable.

    For example how many of you spot that the three dots after the option means that the option is a required parameter? I guess none of you.

In this case I have only showed you the example when we want to directly apply the CLI to the application funtion.
If we had to import the "resize" function from another module we would have to apply the CLI code on a wrapper function exactly like we have done in the first Click example. Typer also support out of the box an helper function and all the various features that we want in our CLI.

{{< code language="python" title="Typer help" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
    Usage: typer_example.py [OPTIONS]
    
      Resize an image.
    
    Options:
      -i TEXT               Input image path  [required]
      --heigth INTEGER      Height of the output image  [default: 256]
      --width INTEGER       Width of the output image  [default: 256]
      -o TEXT               Output image path  [required]
      --install-completion  Install completion for the current shell.
      --show-completion     Show completion for the current shell, to copy it or
                            customize the installation.
    
      --help                Show this message and exit.
{{< /code >}}

It is worth noting that Typer it is based on Click and has no other dependencies.

##### Fire

Fire is an open source project from Google, at first I tougth it was a new project but actually is 4 yars old!
    The idea is simply to not write code at all and genrate the CLI automatically. The implementation is more than trivial:


{{< code language="python" title="Fire implementation" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
import fire
from app import resize

if __name__ == "__main__":
    fire.Fire(resize)
{{< /code >}}

It cannot be more minimalist than this! However, my main concern with the library is that it is so trivial that seems impossible to add some very basic 
customization of the CLI like, shorter names, options, help strings and so on. Also the doc is very not up the the standard of the previous libraries.
The main strength and use case is for very small projects, were quality does not matter much. By the way the help function generated is also very ugly: 



{{< code language="python" title="Fire help" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
NAME
    fire_example.py
    
SYNOPSIS
    fire_example.py IMAGE_PATH SIZE OUTPUT_PATH

POSITIONAL ARGUMENTS
    IMAGE_PATH
    SIZE
    OUTPUT_PATH

NOTES
    You can also use flags syntax for POSITIONAL ARGUMENTS
{{< /code >}}

##### Fastcore

First of all let me say that I love Fastcore. It is a great library that has lots of secrets gems and I think that is generally underrated.
By the way I am a big fan of the work of the authors of Fastcore that are the same of the popular deep learning library Fast.ai.
Here we will use only the subset of the library that permits to implement a CLI. 
Citing from the doc: ''it's 50 lines of code! Basically, it's just a little wrapper around argparse that uses modern Python 
features and some thoughtful defaults to get rid of the boilerplate.'' The approach taken is similar to typer in using type annottions 
to extend the function signature and get a CLI for free. However some features are missing: 

* it seems to me that it is impossible to add shorter names
* it is impossible by design to have keyword arguments that are required
* the difference between a positional and keyword argument is handled by the "default" option in the Param object and this feature is 
not obvious from a quick look at the implementation.


The implementation look like this:



{{< code language="python" title="Fastcore implementation" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
from fastcore.script import call_parse, Param
from PIL import Image
from typing import Tuple


@call_parse
def resize(image_path: Param(help="Input image path", type=str),
            heigth:  Param(help="heigth of the output image", type=int, default=256),
            width:  Param(help="with of the output image", type=int, default=256), 
            output_path:  Param(help="Output image path", type=str)
            ) -> None:
    img = Image.open(image_path)
    img_resized = img.resize((heigth, width)).convert('RGB')
    img_resized.save(output_path, "JPEG")
{{< /code >}}


I leave the help function output out since it is pretty standard. I have a very simple opinion on this CLI library that
for me it has pretty similar to Typer in the implementation and pro/cons but, Typer is better documented more used and has some 
extra nice functionalities that here are missing (short names, real optionality etc). So if you are in for the typed minimalist approach 
go with Typer but please have a quick look at the other fastcore functionalities


## Conclusions


At the end of the day the choice between these libraries is mostly based on each different taste.  But if you are in a hurry and 
you do not want to play around and make your own opinion here is my two cents rule.
If you are working on a serious project and you plan to support users go with Click. The library has all the classical CLI features it is easy to use and 
the documentatio is well written. It is dependencies free and lots of users (stack overflow always help).
On the opposite side if you really want a minimalist approach on a personal project with some friends consider Fire. It is a decent library considering
that it is basically a one liner to implement.

## Going deeper

As already said one of the best resources that I found reagerding CLI design is this one [clig.dev]
Here you have the links for the various documentations of the libraries used: 

* [argparse](https://docs.python.org/3/library/argparse.html)
* [click](https://click.palletsprojects.com/en/7.x/why/#why-not-argparse) 
* [fire](https://github.com/google/python-fire)
* [typer](https://typer.tiangolo.com/tutorial/)

I have not touched the subjects but some of the above libraries also support multiple commands and more advanced uses. 
All the codes examples used here can be found in [this repo](https://github.com/appanacca/python_cli_examples).
