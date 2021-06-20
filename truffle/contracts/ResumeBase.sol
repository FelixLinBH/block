pragma solidity ^0.5.0;

import {StrLib} from "./StrLib.sol";

contract ResumeBase {
    using StrLib for string;

    // address internal government;
    mapping(address => Organization) internal organizations;

    Profile public profile;
    Education[] internal educations;
    Job[] internal experiences;
    Skill[] internal skills;

    enum OrganizationType {user, government, school, company}

    enum EducationStatus {undergraduate, learning, graduate}

    enum Gender {male, female, other}

    enum DoneCode {
        setPermission,
        setEducation,
        setLicense,
        setCourse,
        setExperience,
        setJobEndDate,
        setAutobiography,
        setSkill,
        setContact,
        removePermission,
        removeSkill,
        setEducationValid,
        setExperienceValid,
        setProfileValid
    }

    struct Organization {
        OrganizationType property;
    }

    struct Profile {
        string name;
        address account;
        uint8 age;
        Gender gender;
        string contact;
        string autobiography;
        string isValid;
    }

    struct Job {
        string company;
        string position;
        uint256 startDate;
        uint256 endDate;
        string isValid;
    }

    struct Skill {
        string class;
        string name;
    }

    struct Education {
        string name;
        EducationStatus status;
        string major;
        Course[] courses;
        License[] licenses;
        string isValid;
    }

    struct Course {
        string name;
        string content;
        string comment;
        uint8 grade;
    }

    struct License {
        string name;
        string content;
    }

    modifier onlyGov {
        bool isGov =
            organizations[msg.sender].property == OrganizationType.government;
        require(isGov, "Permission denied. Please use government account.");
        _;
    }

    modifier onlySchool {
        bool isSchool =
            organizations[msg.sender].property == OrganizationType.school;
        require(isSchool, "Permission denied. Please use school account.");
        _;
    }

    modifier onlyCompany {
        bool isCompany =
            organizations[msg.sender].property == OrganizationType.company;
        require(isCompany, "Permission denied. Please use company account.");
        _;
    }

    modifier onlyHost {
        require(
            msg.sender == profile.account,
            "Permission denied. Please use host account."
        );
        _;
    }

    modifier IndexValidator(uint256 index, uint256 max) {
        require(index < max, "Out of range.");
        _;
    }

    event done(DoneCode eventCode, string message);

    constructor(
        string memory name,
        address account,
        uint8 age,
        Gender gender
    ) public {
        // government = msg.sender;
        profile = Profile({
            name: name,
            account: account,
            age: age,
            gender: gender,
            contact: "",
            autobiography: "",
            isValid: ""
        });
    }
}
