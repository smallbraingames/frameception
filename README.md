# Frameception

Create a [Farcaster frame](https://www.dynamic.xyz/blog/farcaster-frames).... from within a farcaster frame.

## Overview
Frameception is a tool that lets users
1. Cast a frame on Farcaster with text input to generate an image
2. Then, create another frame that allows others to mint the image they generated

## Getting Started

First, run `bun install` in the project root to install all dependencies. Then, 

```cd contracts && bun deploy:localhost```
```cd ../client && bun dev```

to get rolling. This project depends on many others, including:

- [Privy's frame minter](https://www.privy.io)
- [Coinbase's onchainkit](https://github.com/coinbase/onchainkit)
- [Replicate for image generation](https://github.com/replicate)