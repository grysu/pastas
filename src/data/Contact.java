package data;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.joda.time.DateTime;

public class Contact {
	private String service;
	private Date startDate;
	private Date endDate;
	private int stroke = -1;
	private String extInfo;
	private String unit;
	private String location;
	private int diagnoseType = -1; //-1=no diagnose, 0=icd-10, 1=icpc-2
	private String diagnoseGroup;
	private String groupName;

	private String firstDate = "07.03.2010";
	private String serviceDiagnoseFile = "E:/helfo_icd_icpc.csv";
	private String diagnoseGroupsFile = "E:/diagnoseGrouping.csv";
	private String serviceGroupsFile = "E:/Gruppering_tjenester.csv";

	public Contact(String[] split, int type) throws Exception {
		if(type==1){
			convertLineStolav(split);
		} else if (type==0) {
			convertLineHelfo(split);
		}else if (type>=2) {
			convertLineMunicipality(split);
		}
	}

	public String getService() {
		return service;
	}

	public void setService(String service) {
		this.service = service;
	}

	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	public Date getEndDate() {
		return endDate;
	}

	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}

	public int getStroke() {
		return stroke;
	}

	public void setStroke(int stroke) {
		this.stroke = stroke;
	}

	public String getExtInfo() {
		return extInfo;
	}

	public void setExtInfo(String extInfo) {
		this.extInfo = extInfo;
	}

	public String getUnit() {
		return unit;
	}

	public void setUnit(String unit) {
		this.unit = unit;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public String getGroupName() {
		return groupName;
	}

	public void setGroupName(String groupName) {
		this.groupName = groupName;
	}

	@Override
	public String toString() {
		return "Contact [service=" + service + ", startDate=" + startDate
				+ ", endDate=" + endDate + ", stroke=" + stroke + ", extInfo="
				+ extInfo + ", unit=" + unit + ", location=" + location
				+ ", diagnoseType=" + diagnoseType + ", diagnoseGroup="
				+ diagnoseGroup + ", groupName=" + groupName
				+ "]";
	}

	public int getDiagnoseType() {
		return diagnoseType;
	}

	public void setDiagnoseType(int diagnoseType) {
		this.diagnoseType = diagnoseType;
	}

	public String getDiagnoseGroup() {
		return diagnoseGroup;
	}

	public void setDiagnoseGroup(String diagnoseGroup) {
		this.diagnoseGroup = diagnoseGroup;
	}

	public void convertLineStolav(String[] split) {
		// extInfo, unit, service, location, pid, startDate, endDAte, stroke, diagnoseGroup, ICPC-2, ICD-10, ageGroup
		SimpleDateFormat format = new SimpleDateFormat("dd.MM.yyyy H:m");
		extInfo=split[0].trim();
		unit=split[1].trim();
		if(split[2].equalsIgnoreCase("")) {
			service=extInfo;
		} else {
			service=split[2].trim();
		}
		location=split[3].trim();
		try {
			startDate = format.parse(split[5]);
		} catch (ParseException e) {
			System.err.println("St. Olav, parsing start date: " + e);
		}
		try {
			endDate = format.parse(split[6]);
			long duration = endDate.getTime() - startDate.getTime();
			if (duration < 86400000) { //One day
				endDate = startDate;
			}
		} catch (ParseException e) {
			System.err.println("St. Olav, parsing end date: " + e);
		}
		stroke=Integer.parseInt(split[7]);
		diagnoseGroup=split[8];
		diagnoseType=0;
		try {
			groupName=findDiagnoseGroup();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}
	
	public void convertLineHelfo(String[] split) {
		// service, pid, startDate, stroke, diagnoseGroup, ICPC-2, ICD-10
		SimpleDateFormat format = new SimpleDateFormat("dd.MM.yyyy");
		service=split[0].trim();
		try {
			startDate = format.parse(split[2]);
			endDate = startDate;
		} catch (ParseException e) {
			System.err.println("HELFO, parsing date: " + e);
		}
		stroke=Integer.parseInt(split[3]);
		diagnoseGroup=split[4];
		try {
			diagnoseType=findDiagnoseType();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		try {
			groupName=findDiagnoseGroup();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public void convertLineMunicipality(String[] split) {
		// PID, Service, Start, End
		SimpleDateFormat format = new SimpleDateFormat("dd.MM.yyyy");
		service = split[1].trim();
		if (!split[2].equals("") && !split[2].equalsIgnoreCase("null")) {
			try {
				startDate = format.parse(split[2]);
			} catch (ParseException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		} else {
			// If no start date: set the variable firstDate as start
			// date
			try {
				startDate = format.parse(firstDate);
			} catch (ParseException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		if (split.length > 3) {
			if (!split[3].equals("")
					&& !split[3].equalsIgnoreCase("null")) {
				try {
					endDate = format.parse(split[3]);
				} catch (ParseException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
		} else {
			// If no end date: set start date as end date
			endDate = startDate;
		}
		try {
			groupName = findServiceGroup();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public int findDiagnoseType() throws IOException {
		BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(new File(serviceDiagnoseFile))));
		String line = null;
		while((line = br.readLine()) != null) {
			String[] split = line.split(";");
			if (split[0].equalsIgnoreCase(service)) {
				return Integer.parseInt(split[1]);
			}
		}
		System.err.println(service);
		return -1;
	}
	
	public String findDiagnoseGroup() throws IOException {
		if(diagnoseType==-1) {
			return null;
		} else {
			BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(new File(diagnoseGroupsFile))));
			String line = null;
			while((line = br.readLine()) != null) {
				String[] split = line.split(";");
				if(diagnoseType==0) {
					if(split[2].equalsIgnoreCase("ICD-10") && split[3].equalsIgnoreCase(diagnoseGroup)) {
						return split[1];
					}
				} else if (diagnoseType==1) {
					if(split[2].equalsIgnoreCase("ICPC-2") && split[3].equalsIgnoreCase(diagnoseGroup)) {
						return split[1];
					}
				}
			}
		}
		return null;
	}
	
	public String findServiceGroup() throws IOException {
		BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(new File(serviceGroupsFile))));
		String line = null;
		while((line = br.readLine()) != null) {
			String[] split = line.split(";");
//			System.err.println(split[0]);
			if (split[0].trim().equalsIgnoreCase(service)) {
//				System.err.println(service);
				return split[1];
			}
		}
		System.out.println(service);
		return null;
	}

	public static void main(String[] args) throws Exception {
		SimpleDateFormat df = new SimpleDateFormat("dd.MM.yyyy");
		DateTime oldDate = new DateTime(df.parse("01.01.2012"));
		DateTime newDate = oldDate.minusDays(Math.abs(666));
		System.out.println(newDate);

	}

}
