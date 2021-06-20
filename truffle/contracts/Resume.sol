pragma solidity ^0.5.0;

import {ResumeBase} from "./ResumeBase.sol";

contract Resume is ResumeBase {
    constructor(
        string memory name,
        address account,
        uint8 age,
        Gender gender
    ) public ResumeBase(name, account, age, gender) {}

    //---------------------------------------------------------------------------
    //@Get Functions
    //---------------------------------------------------------------------------

    function getEducationCount() public view returns (uint256) {
        return educations.length;
    }

    function getExperienceCount() public view returns (uint256) {
        return experiences.length;
    }

    function getSkillCount() public view returns (uint256) {
        return skills.length;
    }

    function getCourseCount(uint256 index)
        public
        view
        IndexValidator(index, getEducationCount())
        returns (uint256)
    {
        return educations[index].courses.length;
    }

    function getLicenseCount(uint256 index)
        public
        view
        IndexValidator(index, getEducationCount())
        returns (uint256)
    {
        return educations[index].licenses.length;
    }

    function getEducation(uint256 index)
        public
        view
        IndexValidator(index, getEducationCount())
        returns (
            string memory,
            EducationStatus,
            string memory
        )
    {
        Education memory edu = educations[index];
        return (edu.name, edu.status, edu.major);
    }

    function getExperience(uint256 index)
        public
        view
        IndexValidator(index, getExperienceCount())
        returns (
            string memory,
            string memory,
            uint256,
            uint256
        )
    {
        Job memory exp = experiences[index];
        return (exp.company, exp.position, exp.startDate, exp.endDate);
    }

    function getSkill(uint256 index)
        public
        view
        IndexValidator(index, getSkillCount())
        returns (string memory, string memory)
    {
        Skill memory skill = skills[index];
        return (skill.class, skill.name);
    }

    function getCourse(uint256 eduIndex, uint256 index)
        public
        view
        IndexValidator(eduIndex, getEducationCount())
        IndexValidator(index, getCourseCount(eduIndex))
        returns (
            string memory,
            string memory,
            string memory,
            uint8
        )
    {
        Course memory course = educations[eduIndex].courses[index];
        return (course.name, course.content, course.comment, course.grade);
    }

    function getLicense(uint256 eduIndex, uint256 index)
        public
        view
        IndexValidator(eduIndex, getEducationCount())
        IndexValidator(index, getCourseCount(eduIndex))
        returns (string memory, string memory)
    {
        License memory license = educations[eduIndex].licenses[index];
        return (license.name, license.content);
    }

    //---------------------------------------------------------------------------
    //@Set Functions
    //---------------------------------------------------------------------------

    // function setPermission(
    //     address account,
    //     string memory name,
    //     OrganizationType property,
    //     bool permission
    // ) public onlyGov {
    //     organizations[account] = Organization({
    //         name: name,
    //         property: property,
    //         account: account,
    //         permission: permission
    //     });
    //     emit done(DoneCode.setPermission, "Set Permission");
    // }

    // function setEducationValid(address account, string memory name, OrganizationType property, bool permission) public onlySchool {

    //     emit done(DoneCode.setEducationValid, "Set Education Valid");
    // }

    function setEducation(
        EducationStatus status,
        string memory major,
        string memory schoolName
    ) public onlyHost {
        educations.length++;
        Education storage edu = educations[educations.length - 1];
        Course memory course =
            Course({name: "", content: "", comment: "", grade: 0});
        License memory license = License({name: "", content: ""});
        edu.name = schoolName;
        edu.status = status;
        edu.major = major;
        edu.isValid = false;
        edu.courses.push(course);
        edu.licenses.push(license);
        emit done(DoneCode.setEducation, "Set Education");
    }

    function setLicense(
        string memory name,
        string memory content,
        uint256 index
    ) public onlyHost {
        // uint256 index = uint256(findOrganization(msg.sender, "education"));
        Education storage edu = educations[index];
        edu.licenses.push(License({name: name, content: content}));
        emit done(DoneCode.setLicense, "Set License");
    }

    function setCourse(
        string memory name,
        string memory content,
        string memory comment,
        uint8 grade,
        uint256 index
    ) public onlyHost {
        // uint256 index = uint256(findOrganization(msg.sender, "education"));
        Education storage edu = educations[index];
        edu.courses.push(
            Course({
                name: name,
                content: content,
                comment: comment,
                grade: grade
            })
        );
        emit done(DoneCode.setCourse, "Set Course");
    }

    function setExperience(
        string memory position,
        uint256 startDate,
        string memory company
    ) public onlyHost {
        Job memory info =
            Job({
                company: company,
                position: position,
                startDate: startDate,
                endDate: 0,
                isValid: false
            });
        experiences.push(info);
        emit done(DoneCode.setExperience, "Set Experience");
    }

    function setJobEndDate(uint256 endDate, uint256 index) public onlyHost {
        // uint256 index = uint256(findOrganization(msg.sender, "experience"));
        experiences[index].endDate = endDate;
        emit done(DoneCode.setJobEndDate, "Set JobEndDate");
    }

    function setAutobiography(string memory text) public onlyHost {
        profile.autobiography = text;
        emit done(DoneCode.setAutobiography, "Set Autobiography");
    }

    function setSkill(string memory class, string memory name) public onlyHost {
        skills.push(Skill({class: class, name: name}));
        emit done(DoneCode.setSkill, "Set Skill");
    }

    function setContact(string memory contact) public onlyHost {
        profile.contact = contact;
        emit done(DoneCode.setContact, "Set Contact");
    }

    //---------------------------------------------------------------------------
    //@Remove Functions
    //---------------------------------------------------------------------------

    // function removePermission(address account) public onlyGov {
    //     Organization storage org = organizations[account];
    //     org.permission = false;
    //     emit done(DoneCode.removePermission, "Remove Permission");
    // }

    function removeSkill() public onlyHost {
        for (uint256 i = 0; i < skills.length; i++) {
            delete skills[i];
        }
        skills.length = 0;
        emit done(DoneCode.removeSkill, "Remove Skill");
    }
}
