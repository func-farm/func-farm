# FuncFarm - Serverless browser extension

[Func.Farm](http://func.farm/)  
  
FuncFarm allows users to quickly create serverless functions by right clicking on selected code snippets, and selecting "create serverless function".  
Functions are saved in users account with a cloud provider of his choice (must provide credentials).  

## Build

To build, use- 
```
npm install
browserify window.js -o window_bundle.js
```

or to monitor files and recompile on change:
```
watchify window.js -o window_bundle.js
```

## Design

FuncFarm is meant to be modular. Cloud provider wrappers are stored in ```providers/ ``` folder and are expected to manage all requirements specific to that cloud provider.  
```interface.js``` serves as a unified interface to load the requested provider wrapper and call ```runFunc``` which all providers should export.  
  
A provider wrapper injects additional input fields to window.html that are required.  
For example, AWS Lambda required a "Handler" be set - the entry point for the function.  
Therefore ```providers/aws-wrapper.js``` should inject a Handler input to the extension screen and extract its value when creating functions.  
  
Provider wrapper should also manage saved credentials as each cloud required a different set, for example -  
AWS Lambda auth required Key, Secret, and Role ARN  (see hardcoded values in aws-wrapper).  
OpenWhisk (IBM) required UID, Key, and API endpoint (HTTP).

So the login for should also be injected to window.html by the provider wrapper, with its unique fields.

## Design Diagram
[diagram](https://www.draw.io/?title=Extension%20Diagram.html#R7VxRl5o4FP41njP7MD1AAOVxdMZtz9nu9nQe2j5mIGpaIG4Io9NfvwkEBIOWbQ0Z3PVFcgMY7s138%2BVLcAIWyf53Creb9yRC8cSxov0E3E8cx3YDm38Jy0tp8adOaVhTHMmTDoZH%2FB1JoyWtOY5Q1jqRERIzvG0bQ5KmKGQtG6SU7NqnrUjc%2FtUtXCPF8BjCWLV%2BwhHbSKvtB4eKtwivN%2FKnZ860rEhgdbJ8kmwDI7JrmMDDBCwoIaw8SvYLFAvnVX4pr1ueqK0bRlHKel3gRMiHbjB98mfAQcGtDMQzjHP5sE8w%2FLamJE%2BjN18z2Wr2UrmiqEDibtYEzHcbzNDjFoaidseDz20blsS8ZPPDFY7jBYkJLa4Fy%2BIj7CRlDbtVfLhdtgVRhvYnH9Cu3cb7GyIJYvSFn1JdUHn6pepCsrxrBK46Z9OImSttUPaVdX3rgzv5gfRoT%2B%2F6iv9QxHuWLBLKNmRNUhg%2FHKzztodDkuBQHjc8i%2FaYfRbmN54sfalqUt7oRpUofpE3iGC2Ke4sTvyKGHuRWIM5I9x0aNAfhGyrIJ4Nlnie86Hij09yGqITLgISz5CuETtxjtsdcopiyPBz%2B%2FcvGj%2BgoGPBvYH27D1Kc17xjqFk4vgxb%2Fj8ifKjtTi6oaJbhTEOv4mnRzHPSSj6TT1x%2FOjye6LL04EuoCYvXXh7jchxeyDHM4YcoDv12Y3E18h1Q6S%2BjFHyDTVq7MCyCuwNGFobmIqtq2ZFiiBDRR5IBb8Ze15z%2BuY1X0deq7vI605jB7i1wFZg70I48HrgwPnVHCcv%2FUAwb1rdJZxZu0u41lGoy0bJq46iXTfj5zqApwDsEaURt7xHWcbnGrcT0Rd9mAjkpE%2BZ%2BCppBibp6MEHZibBN1V8%2F1e6KKnckV8FD2w7rz0upCRFRx6VJhjjdcqLIfcQ4va58B%2Fm8807WZHgKCpQ3RWtdjx1BiY4yoqOGhi3Iy6OFrLn6iYUA8ylThMHzVxx1iORBqb4xEyBXEkjxqg%2FgOlr0h%2BApxs0A7BwY6AJ%2BrAP3xRqgg6SICiAeFBKnnGEaIc0AXfZNQgRCsw8k0KErepEMoMVXhq7c%2FtOhrSkMFudbeZZV9fewizbERqpNZRwz19fn6%2BXR8zwZP187PTQUpOzQ91lhhbLAnfL6Zk4HsXd9az7Swo%2Fdh%2BiZhvTw6fXsKBxJugngquZZ%2FQKumuMaNgqP0%2BJoBkZfBbOvxMXp19L6rEiNBldZg3so8zaV4EAWkY8ldmt8jTklhQmHQPZDYWcayTXSOt6B0IL9ah%2BqLX8F6EC8pjx5x%2B7e%2BuyGZnbUdz7MU%2B5YZ4zNkIdExwrxl3etQbrvOqc5C3PE3EXdR6hq712Rwaqq4Oh8rWjyvUxzhhK0QgzxNFI2KXF%2B4N1YV9xLBaC%2BYo7bIza4PRV7U3yrlIbvJ9zN5%2BbwE0uw9mrHX7nObsxSd1Rl7GIXMYSfL29dKgOCG2YWTRPl5yB3lwDxXT7jNKDcSCgprgFSXmvzsPBCaawV%2Bi3LuBpJd311Wj1LIUE15juhloKAX3SHZiZSndATXcp2olf2WW3AhnbobmYdjAFJsHkaweTGR2wETydYOql91nd%2FWEAMKl6X7WgyMnAsgGpgh2MnhEcq3%2BGXxmY%2FQ%2Btn4dWFZLz0HJMQatq3mugezqQ05dLa0GOq%2BqJIUURfxYMYzGNkesVy9H7ufafGT%2Frz1CnmbTGld%2BBMpTfI0M5xvb2%2ByqTflet7eF0m8s1vqItf%2BeY44sf3n16LD0BeQM6mLa6U5aiDH%2BHT5Ieg%2FlWbKMunsObT7z7yb%2FZIxvDJxTP67cWG7FbFZ%2BfwaZ8k1S2cFJvaW1FuxsYJ1F8a71x%2FGrCX6kPZekX96pXL0JV%2B3Xa15PVKkMX36PuqspFvb4w8vTatZowoC6rfY%2BFEV3WH0aXdfts2vRO9IcBCKC6tt8QV69JoOitq%2BoBkQGOchmgLKfOvXOvHyhen5mSNzUFFE8FykeU5TH7r5IL74fkYmr7oD2OXYRc2K17TofgFp46Tb6SLBkcZUnP6N5qz9GeJQ1oTYNl0OqvaM5mUGMybtW8thwCGapwZIl7K%2FIt4f17R3HxNjdeCT%2FtccaM67y6gWiYrnS8dZqzYrY9srnU8RZDr%2B%2Bir56XFFRJkEP1IUaJGLSkWYXAqi1vrDCKIyEg3gjoiHes%2Fyw24vL2WPWcVxTE7tBr2CNhW%2B6P0dG1v87WssFuqqLjQ%2F2Gm5VtUYhXODzELEGC7o3e6Y5G6PDi4U%2FHSsp2%2BOs28PAP)
