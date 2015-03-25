package data;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashSet;

public class FileManager {

	private ArrayList<Patient> patients = new ArrayList<Patient>();
	private final String folder = "E:/test/v2/";
	private final String helfoFile = "finito_helfo.csv";
	private final String stolavFile = "finito_stolav.csv";
	private final String trdFile = "finito_trondheim.csv";
	private final String malvikFile = "finito_malvik.csv";
	private final String melhusFile = "finito_melhus.csv";
	private final String mgkFile = "finito_mgk.csv";
	
	private final String CSV_split = ";";
//	private static SimpleDateFormat format = new SimpleDateFormat("yyyy, MM, dd");
//	private static Date date = new Date();

	public FileManager() throws Exception {
		readCsvFiles();
		writeStatistics();
	}

	public static void main(String[] args) throws Exception {
		FileManager fm = new FileManager();
//		fm.readPLOFiles();
		// fm.findStroke();
		// System.out.println(fm.getContacts().get(0));
		// fm.printContacts(40060942046L);

	}

	public ArrayList<Patient> getPatients() {
		return patients;
	}

	public void setPatients(ArrayList<Patient> patients) {
		this.patients = patients;
	}

	/**
	 * Finds all contacts for a particular patient.
	 * 
	 * @param pid
	 *            An 11 digit long number, identifying the patient.
	 * @return List containing all contacts of a particular patient.
	 */
	public ArrayList<Contact> findContacts(Long pid) {
		ArrayList<Contact> contacts = new ArrayList<Contact>();
		for (Patient patient : patients) {
			if (patient.getPid().equals(pid)) {
				return patient.getContacts();
			}
		}
		return contacts;
	}

	// public ArrayList<Contact> findStroke() throws ParseException {
	// HashSet<Long> pids = new HashSet<Long>();
	// HashSet<Long> allPids = new HashSet<Long>();
	// ArrayList<Contact> validContacts = new ArrayList<Contact>();
	// date = format.parse("30.06.2010");
	// for (Contact c : contacts) {
	// allPids.add(c.getPid());
	// if (c.getStartDate() != null) {
	// if (c.getStartDate().before(date) && c.getStroke() == 1) {
	// pids.add(c.getPid());
	// }
	// }
	// }
	// System.out.println("All pids: " + allPids.size());
	// for (Long l : pids) {
	// allPids.remove(l);
	// }
	// System.out.println("Unvalid pids: " + pids.size());
	// System.out.println("Valid pids: " + allPids.size());
	// for (Long l : allPids) {
	// validContacts.addAll(findContacts(l, false));
	// }
	// return validContacts;
	// }

	public void readCsvFiles() throws Exception {
		System.out.println("Reading CSV files");
		String[] paths = { folder + helfoFile, folder + stolavFile,
				folder + trdFile, folder + malvikFile, folder + melhusFile,
				folder + mgkFile };

		BufferedReader br = null;
		for (int i = 0; i < paths.length; i++) {
			System.out.println("Reading " + paths[i] );
			br = new BufferedReader(new InputStreamReader(new FileInputStream(
					new File(paths[i]))));
			String line = br.readLine();
			while ((line = br.readLine()) != null) {
				boolean newPatient = true;
				String[] split = line.split(";");
				Long pid = findPid(split, i);
				for (Patient patient : patients) {
					if (patient.getPid().equals(pid)) {
						if (patient.getAgeGroup() == -1 && i == 1) {
							patient.setAgeGroup(Integer.parseInt(split[11]));
						}
						patient.getContacts().add(new Contact(split, i));
						newPatient = false;
					}
				}
				if (newPatient) {

					Patient p = new Patient(pid);
					if (i == 1) {
						p.setAgeGroup(Integer.parseInt(split[11]));
					}
					p.getContacts().add(new Contact(split, i));
					patients.add(p);
				}
			}
		}
	}
	
	public void readPLOFiles() throws Exception {
		System.out.println("Reading CSV files");
		String[] paths = {folder + trdFile, folder + malvikFile, folder + melhusFile,
				folder + mgkFile };

		BufferedReader br = null;
		for (int i = 0; i < paths.length; i++) {
			System.out.println("Reading " + paths[i] );
			Patient p = new Patient(null);
			br = new BufferedReader(new InputStreamReader(new FileInputStream(
					new File(paths[i]))));
			String line = br.readLine();
			while ((line = br.readLine()) != null) {
				String[] split = line.split(";");
				p.getContacts().add(new Contact(split, i+2));
			}
		}
	}
	
	
	public Long findPid(String[] split, int type) {
		if(type==0) {
			return Long.valueOf(split[1]).longValue();
		} else if (type==1) {
			return Long.valueOf(split[4]).longValue();
		} else {
			return Long.valueOf(split[0]).longValue();
		}
	}
	
	public void writeStatistics() {
		HashSet<String> uniquePlaces = new HashSet<String>();
		int contacts = 0;
		int totDiagnoses = 0;
		for (Patient p : patients) {
			for (Contact c : p.getContacts()) {
				contacts++;
				uniquePlaces.add(c.getService());
				if (c.getStroke() == 1)
					totDiagnoses++;
			}

		}

		// Statistics
		System.out.println("Number of contacts: " + contacts);
		System.out.println("Number of unique patients: " + patients.size());
		System.out.println("Number of stroke diagnoses: " + totDiagnoses);
		System.out.println("Number of unique places: " + uniquePlaces.size());

	}
}
