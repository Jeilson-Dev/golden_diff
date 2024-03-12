# Golden Diff

[![Publish Extension](https://github.com/jeilsonaraujo/golden_diff/actions/workflows/publish.yml/badge.svg?branch=main)](https://github.com/jeilsonaraujo/golden_diff/actions/workflows/publish.yml)

Easily compare golden failures and check the difference. A valuable tool to save you time in Flutter development and automated tests.

## Features

This extension looks for images of golden test failures on your project, it makes a list with all the files reached.
By clicking on one it's possible to see the difference between the expected image and the image that was generated by the golden toolkit.

Once there are test failures on your project, there will be a slider that reveals the expected image above the failure.
<hr>
</br>

## Let's see an example:

Imagine you've made some alterations, and suddenly, the tests begin to fail:

![image](https://raw.githubusercontent.com/jeilsonaraujo/golden_diff/main/readme_resources/1%20-%20test%20fails.gif)


With the Golden Diff extension, pinpointing errors becomes effortless. Simply navigate to the extension to quickly identify failures, compare expected versus generated outcomes, and save valuable time troubleshooting.



![image](https://raw.githubusercontent.com/jeilsonaraujo/golden_diff/main/readme_resources/2%20-%20find%20the%20fail.gif)



Here, you can explore the various types of golden tests available, offering insight into what's happening behind the scenes. Golden Diff consolidates this information, streamlining your workflow and saving you precious time:

![image](https://raw.githubusercontent.com/jeilsonaraujo/golden_diff/main/readme_resources/3%20-%20see%20what%20happens.gif)

## Some contributions

<p>Thanks <a href='https://github.com/bbcbreno'>bbcBreno</a> for this suggestion of the extension icon. Thank you for your valuable assistance!</p>
<p><a href='https://github.com/RyanHolanda'>RyanHolanda</a> thank you for suggesting the feature of a library golden of images. Thank you for your valuable contribution and for sharing such an insightful idea!</p>
<p><a href='https://github.com/paulononaka'>PauloNonaka</a> for their invaluable contributions in enhancing the README and providing the idea for a feature to clear golden failure images. Your efforts and ideas have greatly improved the project.</p>

## Release Notes
### 0.0.1
* Initial release with basic features
### 0.0.2
* Included a wonderful icon
### 0.0.3

* added other views to see individual tested master masked and isolated
* adedd hover to easy toggle on tested and master image
* change icon on primary sidebar
### 1.0.0
* fix size aspect ratio
* preparing code to new features
### 1.0.1
* added clear function
* tree view by project
### 1.0.2
* projects and itens are sorted
* fix duplicated itens on tree
### 1.0.3
* automatic refresh when detect new failures
### 1.0.4
* golden library
### 1.0.5
* update tree view
### 1.0.6
* refactor code
* revert update tree view
### 1.0.7
* add a title to failures view
### 1.0.8
* setup automatic deploy
### 1.0.9
* added license
### 1.1.0
* find golden image and failures wherever they are
### 1.1.1
* fix error to get projects

---
<a href="https://www.flaticon.com/free-icons/golden-retriever" title="golden retriever icons">Golden retriever icons created by Freepik - Flaticon</a><br>
<a href="https://www.flaticon.com/free-icons/clear" title="clear icons">Clear icons created by LAFS - Flaticon</a><br>
<a href="https://www.flaticon.com/free-icons/dog" title="dog icons">Dog icons created by Freepik - Flaticon</a><br>
**Enjoy!**
