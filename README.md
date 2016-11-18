# DB-DrScanner_Project

Gilberto Jimenez Orench - gilberto.jimenez@upr.edu
Luis Gonzalez Morell - luis.gonzalez76@upr.edu
Luis Sala Ortiz - luis.sala@upr.edu
	
# Introduction
DrScanner is an application to manage patient’s medical files in a more efficient, organized way, while implementing a fast and simple process. All of the patient’s file will be assigned an unique QR Code. When the QR code is scanned, the application will look, inside a SQL server, for the patient’s file associated with said QR code. If the file does not exist, then new information could be entered to be assigned to the scanned QR Code. If it exists, then the user will have the option to look at the patient’s information and edit it. This app is meant to make the patient registration and the retrieval of the patient’s files easier for hospitals and medical offices in general. Since the world has become more “mobile” in the recent years with the boom of smartphones and tablets, it is fitting that DrScanner should be a mobile application, because of the simplicity these provide. The platform to be used for the creation of the application will be Android.  Android is an open source operating system that is distributed on a variety of mobile systems which are accessible and affordable, making the implementation a breeze compared to other conventional technologies. Also, the fact that android runs on most of smartphones today would assure the product a bigger reach.

# Client App Description

The client side will be based on Android, using native libraries for the user interface and Java Play for web services. There will be two types of users, the Patient/Nurse which can only view his own information, and the Doctor/Admin which will be able to add/view/edit the patients files. It will have a user-friendly interface, having a main screen with options to either scan a file or to access the files on the database. Once a QR Code is scanned, the application will communicate to the database on the background and if the file associated with the QR Code is empty or does not exist, the application will ask to inform the user and ask if a new file will be created or not. If the QR Code is already associated with a file with information, then the application will show the user the patient’s file and provide edit options.
	
# Server Side Description
The server side will be based on PostgreSQL Database Server. The server will contain various tables to store different information.  One table for each type of user will then give access to the respective tables containing the patient's information. However, a fee will be charged for the server and app maintenance. The fee will be charged when the administrator is registering, and the information will then be stored in another table. It will contain a main table containing the following information: 


UUID |
First Name |
Last Name |
DOB |
Telephone Number |
Address |
Array of Diagnosis |

The array of diagnosis will contain:

Diagnosis ICD10 Number |
Date Diagnosed |
Medications Given |
Comments |




# Division of Labor
Tasks are divided, but not limited to, the following:

Gilberto Jimenez Orench- Android Developer and Graphical Design
Luis Gonzalez Morell - Graphical Design and Database Logistics
Luis Sala Ortiz - Android and  SQL Developer




